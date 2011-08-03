<?php
/**
 * Google Geocoding API
 * http://code.google.com/apis/maps/documentation/geocoding/
 */

/* {{{ */

/**
 * Make http request.
 *
 * @param string $method  HTTP Request Method (GET and POST supported)
 * @param string $host    Target IP/Hostname
 * @param string $port    Target TCP port
 * @param string $path    Target URI
 * @param array  $options Options array may contain:
 *                        - params: HTTP GET Data ie. array('var1'=>'val1', ...)
 *                        - body: HTTP POST Data ie. array('var1'=>'val1', ...)
 *                        - cookie: HTTP Cookie Data ie. array('var1' => 'val1', ...)
 *                        - custom_headers: Custom HTTP headers ie. array('Referer: http://localhost/)
 *                        - timeout: Socket timeout in milliseconds
 *                        - req_hdr: Include HTTP request headers
 *                        - res_hdr: Include HTTP response headers
 *
 * @return string
 */
function http_request($method="GET", $host, $port=80, $path="/", array $options=null)
{
  $def_options = array(
    "params" => array(),
    "body" => array(),
    "cookie" => array(),
    "custom_headers" => array(),
    "timeout" => 1000,
    "req_hdr" => false,
    "res_hdr" => false
  );

  $opts = $def_options;
  if (count($options) > 0) {
    foreach ($options as $k=>$v) {
      $opts[$k] = $v;
    }
  }

  $ret = "";
  $method = strtoupper($method);
  $params = $opts["params"];
  $body = $opts["body"];
  $cookie = $opts["cookie"];

  $cookie_str = "";
  $params_str = count($params) ? "?" : "";
  $body_str = "";

  foreach ($params as $k=>$v) {
    $params_str .= urlencode($k)."=".urlencode($v)."&";
  }

  foreach ($body as $k=>$v) {
    $body_str .= urlencode($k) .'='. urlencode($v) .'&';
  }

  foreach ($cookie as $k => $v) {
    $cookie_str .= urlencode($k) .'='. urlencode($v) .'; ';
  }

  $crlf = "\r\n";
  $req  = $method .' '. $path . $params_str .' HTTP/1.1' . $crlf;
  $req .= 'Host: '. $host . $crlf;
  $req .= 'User-Agent: Mozilla/5.0 Firefox/3.6.12' . $crlf;
  $req .= 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8' . $crlf;
  $req .= 'Accept-Language: en-us,en;q=0.5' . $crlf;
  $req .= 'Accept-Encoding: deflate' . $crlf;
  $req .= 'Accept-Charset: ISO-8859-1,utf-8;q=0.7,*;q=0.7' . $crlf;

  foreach ($opts["custom_headers"] as $k => $v) {
    $req .= $k .': '. $v . $crlf;
  }

  if (!empty($cookie_str)) {
    $req .= 'Cookie: '. substr($cookie_str, 0, -2) . $crlf;
  }

  if ($method == 'POST' && !empty($body_str)) {
    $body_str = substr($body_str, 0, -1);
    $req .= 'Content-Type: application/x-www-form-urlencoded' . $crlf;
    $req .= 'Content-Length: '. strlen($body_str) . $crlf . $crlf;
    $req .= $body_str;
  } else {
    $req .= $crlf;
  }

  if ($opts["req_hdr"]) {
    $ret .= $req;
  }

  if (($fp = @fsockopen($host, $port, $errno, $errstr)) == false) {
    return "Error $errno: $errstr\n";
  }

  stream_set_timeout($fp, 0, $opts["timeout"] * 1000);

  fputs($fp, $req);
  while ($line = fgets($fp)) {
    $ret .= $line;
  }
  fclose($fp);

  if (!$opts["res_hdr"]) {
    $ret = substr($ret, strpos($ret, "\r\n\r\n") + 4);
  }

  return $ret;
}

function unchunkHttp11($data)
{
  $fp = 0;
  $outData = "";

  while ($fp < strlen($data)) {
    $rawnum = substr($data, $fp, strpos(substr($data, $fp), "\r\n") + 2);
    $num = hexdec(trim($rawnum));
    $fp += strlen($rawnum);
    $chunk = substr($data, $fp, $num);
    $outData .= $chunk;
    $fp += strlen($chunk);
  }

  return $outData;
}

/* }}} */

$method  = "GET";
$host    = "maps.googleapis.com";
$port    = 80;
$path    = "/maps/api/geocode/json";
$options = array("params" => array("sensor"=>"false"), "res_hdr" => true);

if (!array_key_exists("s", $_REQUEST)) {
  echo json_encode(new StdClass());
  exit;
}

$options["params"]["address"] = $_REQUEST["s"];

$res = http_request("GET", $host, $port, $path, $options);

$data = substr($res, (strpos($res, "\r\n\r\n")+4));
if (strpos(strtolower($res), "transfer-encoding: chunked") !== false) {
    $data = unchunkHttp11($data);
}

echo $data;
