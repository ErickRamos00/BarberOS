// ============================================================
// BarberOS Helpers — Loaded AFTER app.js to override/fix
// ============================================================

// ===== DATA NORMALIZER =====
var _originalLoadUserData = typeof loadUserData === 'function' ? loadUserData : null;

window.loadUserData = async function() {
  if (_originalLoadUserData) {
    await _originalLoadUserData();
  }
  
  // Normalize barbers: nickname -> nick, start_time -> start, end_time -> end
  DB.barbers = DB.barbers.map(function(b) {
    return Object.assign({}, b, {
      nick: b.nick || b.nickname || b.name,
      start: b.start || b.start_time || '09:00',
      end: b.end || b.end_time || '19:00',
      days: b.days || (b.working_days ? b.working_days.map(function(d) { return d.day_of_week; }) : [1,2,3,4,5,6]),
      specialties: b.specialties && b.specialties.length && typeof b.specialties[0] === 'object' 
        ? b.specialties.map(function(s) { return s.service_id; }) 
        : (b.specialties || [])
    });
  });

  // Normalize appointments
  DB.appointments = DB.appointments.map(function(a) {
    var dateStr = a.date || '';
    var timeStr = a.time || '';
    if (!dateStr && a.appointment_date) {
      var d = new Date(a.appointment_date);
      dateStr = d.toISOString().split('T')[0];
      timeStr = d.toTimeString().slice(0, 5);
    }
    return Object.assign({}, a, {
      date: dateStr,
      time: timeStr,
      client: a.client || a.client_name || 'Cliente',
      phone: a.phone || a.client_phone || '',
      email: a.email || a.client_email || '',
      service: a.service || (a.service_id ? String(a.service_id) : ''),
      barber: a.barber || (a.barber_id ? String(a.barber_id) : ''),
      obs: a.obs || a.observations || ''
    });
  });

  // Normalize services
  DB.services = DB.services.map(function(s) {
    return Object.assign({}, s, {
      desc: s.desc || s.description || '',
      barbers: s.barbers || []
    });
  });

  // Normalize clients
  DB.clients = DB.clients.map(function(c) {
    return Object.assign({}, c, {
      since: c.since || c.created_at || '',
      phone: c.phone || '',
      email: c.email || ''
    });
  });
};

// ===== TOAST (proper implementation) =====
window.toast = function(msg, type) {
  type = type || 'info';
  var container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:9999;display:flex;flex-direction:column;gap:10px;';
    document.body.appendChild(container);
  }
  var colors = { success: '#27AE60', error: '#C0392B', warning: '#E67E22', info: '#2980B9' };
  var icons = { success: '✓', error: '✗', warning: '⚠', info: 'ℹ' };
  var el = document.createElement('div');
  el.style.cssText = 'padding:14px 20px;border-radius:10px;color:white;font-size:14px;font-weight:500;box-shadow:0 4px 16px rgba(0,0,0,0.4);animation:slideIn 0.3s ease;display:flex;align-items:center;gap:8px;max-width:400px;background:' + (colors[type] || colors.info) + ';';
  el.innerHTML = '<span style="font-size:16px">' + (icons[type] || '') + '</span> ' + msg;
  container.appendChild(el);
  setTimeout(function() {
    el.style.animation = 'slideOut 0.3s ease';
    setTimeout(function() { el.remove(); }, 300);
  }, 3500);
};

// ===== MODAL (FIXED: clears inline display:none set by initializeModals) =====
window.openModal = function(id) {
  var el = document.getElementById(id);
  if (el) {
    el.classList.remove('hidden');
    el.style.display = '';
    // Clear inline display:none on ALL children with class .modal
    var inners = el.querySelectorAll('.modal');
    for (var i = 0; i < inners.length; i++) {
      inners[i].style.display = '';
    }
    // Also clear on self if it has class .modal
    if (el.classList.contains('modal')) {
      el.style.display = '';
    }
  }
};
window.closeModal = function(id) {
  var el = document.getElementById(id);
  if (el) el.classList.add('hidden');
};

// Fix modal display: clean up inline display:none from initializeModals 
// Must run AFTER DOMContentLoaded since app.js registers its listener there
(function() {
  function cleanAllModals() {
    // Remove inline display:none from ALL .modal and .modal-overlay elements
    var allModals = document.querySelectorAll('.modal, .modal-overlay');
    for (var i = 0; i < allModals.length; i++) {
      if (allModals[i].style.display === 'none') {
        allModals[i].style.display = '';
      }
    }
  }
  // Run multiple times to catch any delayed initializeModals execution
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      setTimeout(cleanAllModals, 50);
      setTimeout(cleanAllModals, 200);
      setTimeout(cleanAllModals, 500);
    });
  } else {
    setTimeout(cleanAllModals, 50);
    setTimeout(cleanAllModals, 200);
    setTimeout(cleanAllModals, 500);
  }
})();

// ===== OVERRIDE handleRegister to use real API =====
window.handleRegister = async function() {
  var name = document.getElementById('reg-name').value.trim();
  var email = document.getElementById('reg-email').value.trim();
  var shop = document.getElementById('reg-shop').value.trim();
  var pass = document.getElementById('reg-pass').value;
  if (!name || !email || !shop || !pass) return toast('Preencha todos os campos', 'error');
  if (pass.length < 6) return toast('Senha deve ter ao menos 6 caracteres', 'error');
  
  try {
    var result = await apiRegister(name, email, '', shop, pass);
    DB.user = result.user || { email: email, name: name, role: 'owner' };
    DB.shop = { name: shop, slug: shop.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') };
    await loadUserData();
    toast('Conta criada com sucesso!', 'success');
    setTimeout(function() { enterOwner(); }, 500);
  } catch (err) {
    // Fallback: try the verify flow for demo compatibility
    DB.pendingEmail = email;
    DB.user = { email: email, name: name, role: 'owner' };
    DB.shop = { name: shop, slug: shop.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') };
    DB.pendingVerifyCode = Math.floor(100000 + Math.random() * 900000).toString();
    var verifyEmailEl = document.getElementById('verify-email-show');
    if (verifyEmailEl) verifyEmailEl.textContent = email;
    showForm('form-verify');
    toast('Codigo enviado para ' + email, 'success');
    setTimeout(function() {
      var hint = document.getElementById('code-hint');
      if (hint) hint.textContent = '(Demo: codigo e ' + DB.pendingVerifyCode + ')';
    }, 500);
  }
};


// ===== OVERRIDE verifyCode to use backend =====
window.verifyCode = async function() {
  var digits = Array.from(document.querySelectorAll('.code-digit')).map(function(d) { return d.value; }).join('');
  if (digits.length < 6) return toast('Digite os 6 digitos', 'error');
  if (digits === DB.pendingVerifyCode) {
    // Try to register on the real backend
    try {
      var pass = document.getElementById('reg-pass').value || 'demo123';
      var result = await apiRegister(DB.user.name, DB.user.email, '', DB.shop.name, pass);
      DB.user = result.user || DB.user;
      await loadUserData();
    } catch (e) {
      // Seed fallback
      seedData();
    }
    toast('E-mail verificado com sucesso!', 'success');
    setTimeout(function() { enterOwner(); }, 600);
  } else {
    toast('Codigo incorreto. Verifique seu e-mail.', 'error');
    var hint = document.getElementById('code-hint');
    if (hint) hint.textContent = 'Codigo incorreto. (Demo: ' + DB.pendingVerifyCode + ')';
  }
};

// ===== INITIALS =====
window.initials = function(name) {
  if (!name) return '??';
  return name.split(' ').map(function(w) { return w[0]; }).join('').toUpperCase().slice(0, 2);
};

// ===== APPOINTMENT ITEM HTML (FIXED ENCODING + ID COMPARISON) =====
window.aptItemHTML = function(a) {
  var svc = DB.services.find(function(s) { return String(s.id) === String(a.service); });
  var barber = DB.barbers.find(function(b) { return String(b.id) === String(a.barber); });
  var statusLabels = { confirmed: 'Confirmado', done: 'Concluído', cancelled: 'Cancelado', pending: 'Pendente' };
  var statusClass = 'status-' + (a.status || 'pending');
  var statusText = statusLabels[a.status] || a.status || 'Pendente';
  // Use service_name from backend if lookup failed
  var svcName = svc ? svc.name : (a.service_name || 'Serviço');
  var barberNick = barber ? (barber.nick || barber.name) : (a.barber_nickname || a.barber_name || '');
  var barberColor = barber ? barber.color : (a.barber_color || 'var(--primary)');
  return '<div class="apt-item">' +
    '<span class="apt-time">' + (a.time || '--:--') + '</span>' +
    '<div class="apt-color-dot" style="background:' + barberColor + '"></div>' +
    '<div class="apt-info">' +
      '<div class="apt-client">' + (a.client || a.client_name || 'Cliente') + '</div>' +
      '<div class="apt-service">' + svcName + (barberNick ? ' — ' + barberNick : '') + '</div>' +
    '</div>' +
    '<span class="apt-status ' + statusClass + '">' + statusText + '</span>' +
  '</div>';
};

// ===== FIX renderBkServices ENCODING =====
window.renderBkServices = function() {
  var container = document.getElementById('bk-services-list');
  if (!container) return;
  container.innerHTML = DB.services.map(function(s) {
    return '<div class="bk-svc-card" onclick="selectService(\'' + s.id + '\',this)" data-id="' + s.id + '">' +
      '<div class="bk-svc-info">' +
        '<div class="bk-svc-name">' + s.name + '</div>' +
        '<div class="bk-svc-meta">⏱ ' + s.duration + ' min' + (s.desc ? ' · ' + s.desc : '') + '</div>' +
      '</div>' +
      '<div class="bk-svc-price">R$' + s.price + '</div>' +
      '<div class="bk-svc-check">✓</div>' +
    '</div>';
  }).join('') || '<p style="color:var(--text-faint)">Nenhum serviço disponível</p>';
};

// ===== FIX renderBkBarbers (add avatar) =====
window.renderBkBarbers = function() {
  var svcId = DB.booking.service;
  var eligible = svcId ? DB.barbers.filter(function(b) {
    var svc = DB.services.find(function(s) { return String(s.id) === String(svcId); });
    return !svc || !svc.barbers || !svc.barbers.length || svc.barbers.map(String).includes(String(b.id));
  }) : DB.barbers;

  var container = document.getElementById('bk-barbers-list');
  if (!container) return;

  container.innerHTML = eligible.map(function(b) {
    return '<div class="bk-barber-card ' + (String(DB.booking.barber) === String(b.id) ? 'selected' : '') + '" onclick="selectBarber(\'' + b.id + '\',this)" data-id="' + b.id + '">' +
      '<div class="bk-barber-av" style="background:' + (b.color || 'var(--primary)') + '">' + initials(b.name) + '</div>' +
      '<div class="bk-barber-name">' + b.name + '</div>' +
      '<div class="bk-barber-spec">' + (b.nick || '') + '</div>' +
    '</div>';
  }).join('');
};

// ===== FIX refreshBarberSelects ENCODING =====
window.refreshBarberSelects = function() {
  var svcSel = document.getElementById('apt-service');
  var barberSel = document.getElementById('apt-barber');
  if (svcSel) svcSel.innerHTML = DB.services.map(function(s) { return '<option value="' + s.id + '">' + s.name + ' — ' + s.duration + 'min — R$' + s.price + '</option>'; }).join('');
  if (barberSel) barberSel.innerHTML = '<option value="">Qualquer disponível</option>' + DB.barbers.map(function(b) { return '<option value="' + b.id + '">' + b.nick + '</option>'; }).join('');
};

// ===== FIX updateAptPreview ENCODING =====
window.updateAptPreview = function() {
  var svcId = document.getElementById('apt-service').value;
  var svc = DB.services.find(function(s) { return s.id === svcId; });
  var barberVal = document.getElementById('apt-barber').value;
  var barber = DB.barbers.find(function(b) { return b.id === barberVal; });
  var time = document.getElementById('apt-time').value;
  var preview = document.getElementById('apt-preview');
  if (svc && preview) {
    preview.textContent = svc.name + ' · ' + svc.duration + 'min · R$ ' + svc.price + (barber ? ' · ' + barber.nick : '') + (time ? ' às ' + time : '');
  }
};

// ===== FIX statusLabel ENCODING =====
window.statusLabel = function(s) {
  var labels = { confirmed: 'Confirmado', done: 'Concluído', cancelled: 'Cancelado', pending: 'Pendente' };
  return labels[s] || s;
};

// ===== BACKEND-CONNECTED saveConfig =====
window.saveConfig = async function() {
  var name = document.getElementById('cfg-name').value.trim();
  var slug = document.getElementById('cfg-slug').value.trim().toLowerCase().replace(/\s+/g, '-');
  var address = document.getElementById('cfg-address') ? document.getElementById('cfg-address').value.trim() : '';
  var phone = document.getElementById('cfg-phone') ? document.getElementById('cfg-phone').value.trim() : '';
  
  if (!name) return toast('Nome da barbearia é obrigatório', 'error');
  
  try {
    await apiUpdateUser({
      name: DB.user.name,
      phone: phone,
      shop_name: name,
      shop_address: address
    });
    DB.shop.name = name;
    DB.shop.slug = slug || DB.shop.slug;
    document.getElementById('sb-shop-name').textContent = name;
    document.getElementById('shop-link').textContent = 'barberos.app/' + (slug || DB.shop.slug);
    if (document.getElementById('bp-shop-name')) document.getElementById('bp-shop-name').textContent = name;
    toast('✓ Dados salvos com sucesso!', 'success');
  } catch (err) {
    toast('✗ Erro ao salvar: ' + err.message, 'error');
  }
};

// ===== BACKEND-CONNECTED saveHours =====
window.saveHours = async function() {
  try {
    await apiSaveHoursConfig(DB.hours);
    toast('✓ Horários salvos com sucesso!', 'success');
  } catch (err) {
    toast('✗ Erro ao salvar horários: ' + err.message, 'error');
  }
};

// ===== BACKEND-CONNECTED saveNotifs =====
window.saveNotifs = async function() {
  var notifs = {
    whatsapp: document.getElementById('notif-whatsapp') ? document.getElementById('notif-whatsapp').checked : true,
    email: document.getElementById('notif-email') ? document.getElementById('notif-email').checked : true,
    owner: document.getElementById('notif-owner') ? document.getElementById('notif-owner').checked : true,
    '24h': document.getElementById('notif-24h') ? document.getElementById('notif-24h').checked : false
  };
  try {
    await apiSaveNotifications(notifs);
    toast('✓ Preferências de notificação salvas!', 'success');
  } catch (err) {
    toast('✗ Erro ao salvar: ' + err.message, 'error');
  }
};

// ===== BACKEND-CONNECTED changePassword =====
window.changePassword = async function() {
  var newPass = document.getElementById('cfg-newpass').value;
  var confirmPass = document.getElementById('cfg-confirmpass').value;
  if (!newPass) return toast('Digite a nova senha', 'error');
  if (newPass !== confirmPass) return toast('As senhas não coincidem', 'error');
  if (newPass.length < 8) return toast('Senha deve ter ao menos 8 caracteres', 'error');
  
  try {
    // Note: For change password, we'd need the current password too
    // For now, we send it but the backend may need adjustment
    await apiChangePassword('', newPass);
    toast('✓ Senha alterada com sucesso!', 'success');
    document.getElementById('cfg-newpass').value = '';
    document.getElementById('cfg-confirmpass').value = '';
  } catch (err) {
    toast('✗ Erro: ' + err.message, 'error');
  }
};

// ===== BACKEND-CONNECTED saveIdentity =====
window.saveIdentity = async function() {
  DB.identity.welcome = (document.getElementById('cfg-welcome') || {}).value || DB.identity.welcome;
  try {
    await apiSaveIdentity({
      color_primary: DB.identity.primary,
      color_bg: DB.identity.bg,
      color_text: DB.identity.text,
      color_card: DB.identity.card,
      font_display: DB.identity.fontDisplay,
      welcome_message: DB.identity.welcome
    });
    if (document.getElementById('bk-shop-sub')) document.getElementById('bk-shop-sub').textContent = DB.identity.welcome;
    applyThemeToBooking();
    toast('✓ Identidade visual salva e publicada!', 'success');
  } catch (err) {
    toast('✗ Erro ao salvar: ' + err.message, 'error');
  }
};

// ===== BACKEND-CONNECTED changeStatus =====
window.changeStatus = async function(aptId, status) {
  try {
    await apiChangeAppointmentStatus(aptId, status);
    var a = DB.appointments.find(function(a) { return a.id === aptId; });
    if (a) a.status = status;
    renderAgenda();
    renderDashboard();
    toast('✓ Status atualizado: ' + statusLabel(status), 'success');
  } catch (err) {
    // Fallback to local
    var a2 = DB.appointments.find(function(a) { return a.id === aptId; });
    if (a2) { a2.status = status; renderAgenda(); renderDashboard(); }
    toast('Status atualizado (local)', 'info');
  }
};

// ===== NEW BOOKING RESET =====
window.newBooking = function() {
  initBooking();
};

// ===== EMAIL API FUNCTIONS =====
async function apiSendVerificationCode(email, purpose) {
  return await apiCall('POST', '/email/send-code', { email: email, purpose: purpose || 'verificacao' });
}

async function apiVerifyCode(email, code) {
  return await apiCall('POST', '/email/verify-code', { email: email, code: code });
}

async function apiSendAppointmentEmail(email, data) {
  return await apiCall('POST', '/email/appointment-confirmation', {
    email: email,
    service: data.service,
    barber: data.barber,
    date: data.date,
    time: data.time,
    shopName: data.shopName
  });
}

async function apiTestEmailConfig() {
  return await apiCall('GET', '/email/test-config');
}

// ===== OVERRIDE REGISTER TO USE BACKEND =====
window.handleRegister = async function() {
  var name = document.getElementById('reg-name').value.trim();
  var email = document.getElementById('reg-email').value.trim();
  var phoneEl = document.getElementById('reg-phone');
  var phone = phoneEl ? phoneEl.value.trim() : '';
  var shop = document.getElementById('reg-shop').value.trim();
  var pass = document.getElementById('reg-pass').value;
  
  if (!name || !email || !shop || !pass) return toast('Preencha todos os campos', 'error');
  if (pass.length < 8) return toast('Senha deve ter ao menos 8 caracteres', 'error');

  DB.pendingEmail = email;
  DB.pendingRegData = { name: name, email: email, phone: phone, shop: shop, pass: pass };
  DB.user = { email: email, name: name, role: 'owner' };
  DB.shop = { name: shop, slug: shop.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') };

  try {
    var result = await apiCall('POST', '/email/send-code', { email: email, purpose: 'registro' });
    document.getElementById('verify-email-show').textContent = email;
    showForm('form-verify');
    toast('✉ Código enviado para ' + email, 'success');
    
    if (result.demoCode) {
      DB.pendingVerifyCode = result.demoCode;
      setTimeout(function() {
        var hint = document.getElementById('code-hint');
        if (hint) hint.textContent = '(Demo: código é ' + result.demoCode + ')';
      }, 500);
    }
  } catch (err) {
    toast('Erro ao enviar código: ' + err.message, 'error');
  }
};

// Override verifyCode
window.verifyCode = async function() {
  var digits = [];
  document.querySelectorAll('.code-digit').forEach(function(d) { digits.push(d.value); });
  var code = digits.join('');
  if (code.length < 6) return toast('Digite os 6 dígitos', 'error');

  try {
    await apiCall('POST', '/email/verify-code', { email: DB.pendingEmail, code: code });
    
    if (DB.pendingRegData) {
      try {
        var regResult = await apiRegister(
          DB.pendingRegData.name, DB.pendingRegData.email,
          DB.pendingRegData.phone, DB.pendingRegData.shop,
          DB.pendingRegData.pass
        );
        DB.user = regResult.user || DB.user;
        if (regResult.user && regResult.user.shop) {
          DB.shop.name = regResult.user.shop;
        }
        await loadUserData();
      } catch (regErr) {
        console.warn('Registro no backend falhou, usando seed:', regErr.message);
        seedData();
      }
    } else {
      seedData();
    }

    toast('✓ E-mail verificado com sucesso!', 'success');
    setTimeout(enterOwner, 600);
  } catch (err) {
    toast(err.message || 'Código incorreto', 'error');
    if (DB.pendingVerifyCode) {
      var hint = document.getElementById('code-hint');
      if (hint) hint.textContent = 'Código incorreto. (Demo: ' + DB.pendingVerifyCode + ')';
    }
  }
};

// Override resendCode
window.resendCode = async function() {
  try {
    var result = await apiCall('POST', '/email/send-code', { email: DB.pendingEmail, purpose: 'registro' });
    toast('✉ Novo código enviado!', 'success');
    if (result.demoCode) {
      DB.pendingVerifyCode = result.demoCode;
      var hint = document.getElementById('code-hint');
      if (hint) hint.textContent = '(Demo: novo código é ' + result.demoCode + ')';
    }
  } catch (err) {
    toast('Erro: ' + err.message, 'error');
  }
};

// ===== CONFIRM BOOKING (BACKEND CONNECTED) =====
window.confirmBooking = async function() {
  var name = (document.getElementById('bk-client-name') || document.getElementById('bk-name') || {}).value;
  var phone = (document.getElementById('bk-client-phone') || document.getElementById('bk-phone') || {}).value;
  var email = (document.getElementById('bk-client-email') || document.getElementById('bk-email') || {}).value;
  
  if (!name || !phone || !DB.booking.service || !DB.booking.date || !DB.booking.time) {
    toast('Preencha todos os campos obrigatórios', 'error');
    return;
  }
  
  var svc = DB.services.find(function(s) { return String(s.id) === String(DB.booking.service); });
  var barber = DB.booking.barber ? DB.barbers.find(function(b) { return String(b.id) === String(DB.booking.barber); }) : null;
  if (!barber && DB.barbers.length > 0) barber = DB.barbers[0];

  var appointment = {
    client: name,
    phone: phone,
    email: email || '',
    service: DB.booking.service,
    barber: barber ? barber.id : '',
    date: DB.booking.date,
    time: DB.booking.time,
    status: 'confirmed',
    obs: (document.getElementById('bk-client-obs') || {}).value || ''
  };
  
  // Try to save to backend
  try {
    var savedApt;
    if (DB.isPublic && DB.shop && DB.shop.slug) {
      savedApt = await apiBookPublic(DB.shop.slug, appointment);
    } else {
      savedApt = await apiCreateAppointment(appointment);
    }
    DB.appointments.push(savedApt || appointment);
  } catch (err) {
    console.warn('Backend save failed, saving locally:', err.message);
    appointment.id = 'apt-' + Date.now();
    DB.appointments.push(appointment);
  }
  
  // Show success card
  var successCard = document.getElementById('success-card');
  if (successCard) {
    var dateFormatted = new Date(DB.booking.date + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
    successCard.innerHTML = 
      '<div class="bs-row"><span class="bs-label">Serviço</span><span class="bs-val">' + (svc ? svc.name : '') + '</span></div>' +
      '<div class="bs-row"><span class="bs-label">Barbeiro</span><span class="bs-val">' + (barber ? barber.name : 'Qualquer') + '</span></div>' +
      '<div class="bs-row"><span class="bs-label">Data</span><span class="bs-val">' + dateFormatted + '</span></div>' +
      '<div class="bs-row"><span class="bs-label">Horário</span><span class="bs-val">' + DB.booking.time + '</span></div>' +
      '<div class="bs-row"><span class="bs-label">Valor</span><span class="bs-price">R$' + (svc ? svc.price : 0) + '</span></div>';
  }

  // Show success step
  document.querySelectorAll('[id^="bk-step-"]').forEach(function(e) { e.style.display = 'none'; });
  var successStep = document.getElementById('bk-step-success');
  if (successStep) { successStep.style.display = 'block'; successStep.classList.remove('hidden'); }

  // Send confirmation email
  if (email) {
    try {
      var dateFormatted2 = new Date(DB.booking.date + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
      await apiSendAppointmentEmail(email, {
        service: svc ? svc.name : 'Serviço',
        barber: barber ? barber.name : 'Qualquer disponível',
        date: dateFormatted2 || DB.booking.date,
        time: DB.booking.time,
        shopName: DB.shop ? DB.shop.name : 'BarberOS'
      });
      console.log('Email de confirmação enviado para ' + email);
    } catch (emailErr) {
      console.warn('Erro ao enviar email:', emailErr);
    }
  }
};

// ===== FIX LOGOUT =====
window.logout = function() {
  DB.user = null;
  DB.shop = null;
  clearAuth();
  showScreen('auth-screen');
  showForm('form-login');
};

// ===== FIX loginDemoClient (use backend data when available) =====
window.loginDemoClient = async function() {
  DB.user = { email: 'cliente@demo.com', name: 'Cliente Demo', role: 'client' };
  DB.shop = { name: 'Barbearia Demo', slug: 'barbearia-demo' };
  
  // Try to load real data from backend
  try {
    var loginResult = await apiLogin('demo@barberos.app', 'demo123');
    if (loginResult.user) {
      DB.user = Object.assign(DB.user, { role: 'client' });
      DB.shop = { name: loginResult.user.shop || 'Barbearia Demo', slug: loginResult.user.slug || 'barbearia-demo' };
    }
    await loadUserData();
  } catch (err) {
    console.warn('Demo login failed, using seed data');
    seedData();
  }
  
  enterClient();
};

// ===== OVERRIDE renderDashboard for String ID matching =====
window.renderDashboard = function() {
  var today = new Date().toISOString().split('T')[0];
  var todayApts = DB.appointments.filter(function(a) { return a.date === today && a.status !== 'cancelled'; });
  var todayRevenue = todayApts.filter(function(a) { return a.status === 'done'; }).reduce(function(s, a) {
    var svc = DB.services.find(function(sv) { return String(sv.id) === String(a.service); });
    return s + (svc ? svc.price : 0);
  }, 0);
  var newClients = DB.clients.filter(function(c) {
    return (c.since || c.created_at || '').startsWith(new Date().toISOString().slice(0, 7));
  }).length;
  var maxSlots = 20;
  var ocupacao = Math.round((todayApts.length / maxSlots) * 100);

  var el;
  el = document.getElementById('kpi-today'); if (el) el.textContent = todayApts.length;
  el = document.getElementById('kpi-revenue'); if (el) el.textContent = 'R$ ' + todayRevenue;
  el = document.getElementById('kpi-new-clients'); if (el) el.textContent = newClients || DB.clients.length;
  el = document.getElementById('kpi-ocupacao'); if (el) el.textContent = Math.min(ocupacao, 100) + '%';

  var container = document.getElementById('dash-appointments');
  if (container) {
    var sorted = todayApts.sort(function(a, b) { return a.time.localeCompare(b.time); }).slice(0, 5);
    if (!sorted.length) {
      container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📅</div><p>Nenhum agendamento hoje</p></div>';
    } else {
      container.innerHTML = sorted.map(function(a) { return aptItemHTML(a); }).join('');
    }
  }

  var bc = document.getElementById('dash-barbers');
  if (bc) {
    bc.innerHTML = DB.barbers.map(function(b) {
      var apts = DB.appointments.filter(function(a) {
        return String(a.barber) === String(b.id) && a.date === today && a.status !== 'cancelled';
      }).length;
      return '<div class="barber-mini">' +
        '<div class="barber-av" style="background:' + b.color + '">' + initials(b.name) + '</div>' +
        '<div class="barber-mini-info"><div class="barber-mini-name">' + (b.nick || b.name) + '</div><div class="barber-mini-status">' + (b.specialties && typeof b.specialties[0] === 'string' ? b.specialties.slice(0, 2).join(', ') : '') + '</div></div>' +
        '<div class="barber-mini-apts">' + apts + ' hoje</div>' +
      '</div>';
    }).join('');
  }

  if (typeof renderWeekChart === 'function') renderWeekChart();
};

// ===== OVERRIDE renderWeekChart with fixed encoding =====
window.renderWeekChart = function() {
  var days = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
  var today = new Date();
  var chart = document.getElementById('week-chart');
  if (!chart) return;
  var weekData = [];
  for (var i = 6; i >= 0; i--) {
    var d = new Date(today); d.setDate(today.getDate() - i);
    var dateStr = d.toISOString().split('T')[0];
    var apts = DB.appointments.filter(function(a) { return a.date === dateStr && a.status === 'done'; });
    var revenue = apts.reduce(function(s, a) {
      var svc = DB.services.find(function(sv) { return String(sv.id) === String(a.service); });
      return s + (svc ? svc.price : 0);
    }, 0);
    weekData.push({ day: days[d.getDay()], revenue: revenue, isToday: i === 0 });
  }
  var max = Math.max.apply(null, weekData.map(function(d) { return d.revenue; }).concat([100]));
  chart.innerHTML = weekData.map(function(d) {
    return '<div class="chart-bar-item">' +
      '<div class="bar-fill ' + (d.isToday ? 'today' : '') + '" style="height:' + Math.max((d.revenue / max) * 90, 4) + 'px" title="R$ ' + d.revenue + '"></div>' +
      '<div class="bar-val">R$' + d.revenue + '</div>' +
      '<div class="bar-label">' + d.day + '</div>' +
    '</div>';
  }).join('');
};

// ===== OVERRIDE renderAgenda for String ID matching =====
window.renderAgenda = function() {
  var base = new Date();
  base.setDate(base.getDate() + agendaDateOffset);
  var dateStr = base.toISOString().split('T')[0];
  var opts = { weekday: 'long', day: 'numeric', month: 'long' };
  var dateLabel = document.getElementById('agenda-date');
  if (dateLabel) {
    dateLabel.textContent = agendaDateOffset === 0 ? 'Hoje, ' + base.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' }) : base.toLocaleDateString('pt-BR', opts);
  }

  var sel = document.getElementById('agenda-filter-barber');
  if (sel) {
    sel.innerHTML = '<option value="">Todos os barbeiros</option>' + DB.barbers.map(function(b) { return '<option value="' + b.id + '">' + (b.nick || b.name) + '</option>'; }).join('');
  }

  var filterBarber = sel ? sel.value : '';
  var barbers = filterBarber ? DB.barbers.filter(function(b) { return String(b.id) === String(filterBarber); }) : DB.barbers;

  var view = document.getElementById('agenda-view');
  if (!view) return;
  var apts = DB.appointments.filter(function(a) { return a.date === dateStr && a.status !== 'cancelled'; });

  if (!barbers.length) {
    view.innerHTML = '<div class="empty-state"><div class="empty-state-icon">✂</div><p>Nenhum barbeiro cadastrado</p></div>';
    return;
  }

  view.innerHTML = barbers.map(function(b) {
    var bApts = apts.filter(function(a) { return String(a.barber) === String(b.id); }).sort(function(a, c) { return a.time.localeCompare(c.time); });
    var slots = bApts.length ? bApts.map(function(a) {
      var svc = DB.services.find(function(s) { return String(s.id) === String(a.service); });
      var svcName = svc ? svc.name : (a.service_name || 'Serviço');
      return '<div class="time-block" style="border-left-color:' + b.color + '" onclick="editAppointment(\'' + a.id + '\')">' +
        '<div class="tb-time">' + a.time + ' - ' + (svc ? svc.duration : 30) + 'min</div>' +
        '<div class="tb-client">' + (a.client || a.client_name || 'Cliente') + '</div>' +
        '<div class="tb-service">' + svcName + '</div>' +
        '<div class="tb-actions">' +
          (a.status !== 'done' ? '<button class="tb-btn confirm" onclick="event.stopPropagation();changeStatus(\'' + a.id + '\',\'done\')">✓ Feito</button>' : '') +
          (a.status === 'pending' ? '<button class="tb-btn" onclick="event.stopPropagation();changeStatus(\'' + a.id + '\',\'confirmed\')">Confirmar</button>' : '') +
          '<button class="tb-btn cancel" onclick="event.stopPropagation();changeStatus(\'' + a.id + '\',\'cancelled\')">✕</button>' +
        '</div>' +
      '</div>';
    }).join('') : '<div class="abc-empty">Sem agendamentos</div>';

    return '<div class="agenda-barber-col">' +
      '<div class="abc-header">' +
        '<div class="barber-av" style="background:' + b.color + ';width:28px;height:28px;font-size:.65rem">' + initials(b.name) + '</div>' +
        '<div class="abc-name">' + (b.nick || b.name) + '</div>' +
        '<div class="abc-count">' + bApts.length + ' apt</div>' +
      '</div>' +
      '<div class="abc-slots">' + slots + '</div>' +
    '</div>';
  }).join('');
};

// ===== OVERRIDE renderFinanceiro for proper encoding =====
window.renderFinanceiro = function(period) {
  period = period || 'week';
  var apts = DB.appointments.filter(function(a) { return a.status === 'done'; });
  var revenue = apts.reduce(function(s, a) {
    var svc = DB.services.find(function(sv) { return String(sv.id) === String(a.service); });
    return s + (svc ? svc.price : 0);
  }, 0);
  var avgTicket = apts.length ? Math.round(revenue / apts.length) : 0;
  var commission = Math.round(revenue * 0.4);

  var finKpis = document.getElementById('fin-kpis');
  if (finKpis) {
    finKpis.innerHTML =
      '<div class="kpi-card"><div class="kpi-icon">💰</div><div class="kpi-body"><span class="kpi-label">Faturamento total</span><span class="kpi-val">R$ ' + revenue + '</span></div></div>' +
      '<div class="kpi-card"><div class="kpi-icon">🎯</div><div class="kpi-body"><span class="kpi-label">Ticket médio</span><span class="kpi-val">R$ ' + avgTicket + '</span></div></div>' +
      '<div class="kpi-card"><div class="kpi-icon">📊</div><div class="kpi-body"><span class="kpi-label">Atendimentos</span><span class="kpi-val">' + apts.length + '</span></div></div>' +
      '<div class="kpi-card"><div class="kpi-icon">💸</div><div class="kpi-body"><span class="kpi-label">Comissões</span><span class="kpi-val">R$ ' + commission + '</span></div></div>';
  }

  var barberRevenue = DB.barbers.map(function(b) {
    var bApts = apts.filter(function(a) { return String(a.barber) === String(b.id); });
    var rev = bApts.reduce(function(s, a) {
      var svc = DB.services.find(function(sv) { return String(sv.id) === String(a.service); });
      return s + (svc ? svc.price : 0);
    }, 0);
    return { name: b.nick || b.name, color: b.color, rev: rev };
  }).sort(function(a, b) { return b.rev - a.rev; });
  var maxRev = Math.max.apply(null, barberRevenue.map(function(b) { return b.rev; }).concat([1]));
  var finBarberChart = document.getElementById('fin-barber-chart');
  if (finBarberChart) {
    finBarberChart.innerHTML = barberRevenue.map(function(b) {
      return '<div class="fin-bar-item"><div class="fin-bar-name">' + b.name + '</div><div class="fin-bar-track"><div class="fin-bar-fill" style="width:' + (b.rev / maxRev) * 100 + '%;background:' + b.color + '"></div></div><div class="fin-bar-val">R$ ' + b.rev + '</div></div>';
    }).join('');
  }

  var svcRevenue = DB.services.map(function(s) {
    var sApts = apts.filter(function(a) { return String(a.service) === String(s.id); });
    return { name: s.name, count: sApts.length, rev: sApts.length * s.price };
  }).sort(function(a, b) { return b.count - a.count; });
  var maxCount = Math.max.apply(null, svcRevenue.map(function(s) { return s.count; }).concat([1]));
  var finSvcChart = document.getElementById('fin-services-chart');
  if (finSvcChart) {
    finSvcChart.innerHTML = svcRevenue.map(function(s) {
      return '<div class="fin-bar-item"><div class="fin-bar-name">' + s.name + '</div><div class="fin-bar-track"><div class="fin-bar-fill" style="width:' + (s.count / maxCount) * 100 + '%"></div></div><div class="fin-bar-val">' + s.count + 'x</div></div>';
    }).join('');
  }

  var finTrans = document.getElementById('fin-transactions');
  if (finTrans) {
    finTrans.innerHTML = apts.sort(function(a, b) { return b.date.localeCompare(a.date); }).slice(0, 20).map(function(a) {
      var svc = DB.services.find(function(s) { return String(s.id) === String(a.service); });
      var b = DB.barbers.find(function(bb) { return String(bb.id) === String(a.barber); });
      return '<tr>' +
        '<td>' + new Date(a.date + 'T00:00:00').toLocaleDateString('pt-BR') + '</td>' +
        '<td>' + (a.client || 'Cliente') + '</td>' +
        '<td>' + (svc ? svc.name : '—') + '</td>' +
        '<td>' + (b ? (b.nick || b.name) : '—') + '</td>' +
        '<td><strong style="color:var(--success)">R$ ' + (svc ? svc.price : 0) + '</strong></td>' +
        '<td><span class="apt-status status-done">Concluído</span></td>' +
      '</tr>';
    }).join('') || '<tr><td colspan="6" style="text-align:center;color:var(--text-faint);padding:2rem">Sem transações</td></tr>';
  }
};

// ===== OVERRIDE renderBarbers with fixed encoding =====
window.renderBarbers = function() {
  var grid = document.getElementById('barbers-grid');
  if (!grid) return;
  if (!DB.barbers.length) {
    grid.innerHTML = '<div class="empty-state"><div class="empty-state-icon">✂</div><p>Nenhum barbeiro cadastrado ainda. Adicione o primeiro!</p></div>';
    return;
  }
  var today = new Date().toISOString().split('T')[0];
  grid.innerHTML = DB.barbers.map(function(b) {
    var apts = DB.appointments.filter(function(a) { return String(a.barber) === String(b.id) && a.status === 'done'; });
    var revenue = apts.reduce(function(s, a) {
      var svc = DB.services.find(function(sv) { return String(sv.id) === String(a.service); });
      return s + (svc ? svc.price : 0);
    }, 0);
    var todayApts = DB.appointments.filter(function(a) { return String(a.barber) === String(b.id) && a.date === today && a.status !== 'cancelled'; }).length;
    return '<div class="barber-card">' +
      '<div class="bc-top">' +
        '<div class="bc-av" style="background:' + b.color + '">' + initials(b.name) + '</div>' +
        '<div class="bc-info"><div class="bc-name">' + b.name + '</div><div class="bc-role">' + (b.commission || 40) + '% comissão</div></div>' +
      '</div>' +
      '<div class="bc-stats">' +
        '<div class="bc-stat"><span class="bc-stat-val">' + todayApts + '</span><span class="bc-stat-label">Hoje</span></div>' +
        '<div class="bc-stat"><span class="bc-stat-val">' + apts.length + '</span><span class="bc-stat-label">Total</span></div>' +
        '<div class="bc-stat"><span class="bc-stat-val">R$' + revenue + '</span><span class="bc-stat-label">Receita</span></div>' +
      '</div>' +
      '<div class="bc-tags">' + ((b.specialties && typeof b.specialties[0] === 'string') ? b.specialties.map(function(s) { return '<span class="bc-tag">' + s + '</span>'; }).join('') : '') + '</div>' +
      '<div class="bc-actions">' +
        '<button class="btn-sm" onclick="openBarberModal(\'' + b.id + '\')">✎ Editar</button>' +
        '<button class="btn-sm" onclick="showOwnerPage(\'agenda\')">Ver agenda</button>' +
        '<button class="btn-sm" style="border-color:var(--primary);color:var(--primary)" onclick="deleteBarber(\'' + b.id + '\')">Remover</button>' +
      '</div>' +
    '</div>';
  }).join('');
};

// ===== OVERRIDE renderClients with fixed encoding =====
window.renderClients = function(filter) {
  filter = filter || '';
  var tbody = document.getElementById('clients-tbody');
  if (!tbody) return;
  var clients = filter ? DB.clients.filter(function(c) {
    return c.name.toLowerCase().includes(filter) || (c.phone || '').includes(filter) || (c.email || '').toLowerCase().includes(filter);
  }) : DB.clients;
  if (!clients.length) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:2rem;color:var(--text-faint)">Nenhum cliente encontrado</td></tr>';
    return;
  }
  tbody.innerHTML = clients.map(function(c) {
    var cApts = DB.appointments.filter(function(a) { return (a.client === c.name || String(a.client_id) === String(c.id)) && a.status !== 'cancelled'; });
    var lastApt = cApts.sort(function(a, b) { return b.date.localeCompare(a.date); })[0];
    var total = cApts.filter(function(a) { return a.status === 'done'; }).reduce(function(s, a) {
      var svc = DB.services.find(function(sv) { return String(sv.id) === String(a.service); });
      return s + (svc ? svc.price : 0);
    }, 0);
    var since = lastApt ? new Date(lastApt.date + 'T00:00:00').toLocaleDateString('pt-BR') : '—';
    return '<tr>' +
      '<td><div style="display:flex;align-items:center;gap:.6rem"><div style="width:28px;height:28px;border-radius:50%;background:var(--primary);display:flex;align-items:center;justify-content:center;font-size:.62rem;font-weight:700;color:white;flex-shrink:0">' + initials(c.name) + '</div><strong>' + c.name + '</strong></div></td>' +
      '<td>' + (c.phone || '') + '</td>' +
      '<td>' + since + '</td>' +
      '<td>' + cApts.length + '</td>' +
      '<td>R$ ' + total + '</td>' +
      '<td><button class="btn-sm" onclick="viewClient(\'' + c.id + '\')">Ver</button></td>' +
    '</tr>';
  }).join('');
};

console.log('BarberOS helpers v3 loaded successfully');
