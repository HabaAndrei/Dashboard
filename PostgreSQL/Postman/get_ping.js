function ping(req, res) {
  res.statusCode = 200;
  res.statusMessage = "OK";
  return res.json({
    answer: "OK",
  });
}
export default ping;
