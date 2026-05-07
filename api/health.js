module.exports = (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'BarberOS está vivo!',
    time: new Date().toISOString(),
    node_version: process.version
  });
};
