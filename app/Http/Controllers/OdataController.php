<?php
namespace App\Http\Controllers;

class OdataController extends Controller
{
    public function ProcessGet()
    {
		$version     = "v0.0.1";
        $url         = "";
        $requestBody = "";
        $methodData  = Array(
            "GET" => 0,
            "POST" => 0,
            "PUT" => 0,
            "PATCH" => 0,
            "DELETE" => 0
        );
		$opt = "";
        foreach($methodData as $tName=>$tSelected) {
                $opt .= sprintf("<option value='%s' %s>%s</option>", $tName, ($tSelected == 1) ? "selected" : "", $tName);
        }
		$url = htmlspecialchars($url, ENT_QUOTES, "UTF-8");
		return view('odata', ["opt" => $opt, "version" => $version, "url" =>$url
			,"requestHeaderRaw"=>"","requestBody"=>"","rHeader"=>"","rData"=>"","rError"=>""]);

    }

    public function ProcessPost()
    {
        $version     = "v0.0.1";
        $url         = "";
        $requestBody = "";
        $methodData  = Array(
            "GET" => 0,
            "POST" => 0,
            "PUT" => 0,
            "PATCH" => 0,
            "DELETE" => 0
        );
        if (count($_POST) > 0) {
            $url                        = $_POST['api'];
            //      $proxy = "localhost:9001";
            $requestMethod              = $_POST['requestMethod'];
            $methodData[$requestMethod] = 1;
            $requestBody                = $_POST['requestBody'];
            $requestHeaderRaw           = $_POST['requestHeader'];
            $requestHeaders             = Array();
            $requestHeaderLines         = explode("\n", $requestHeaderRaw);
            foreach ($requestHeaderLines as $line) {
                if (strpos($line, ":") !== false) {
                    $requestHeaders[] = trim($line);
                }
            }
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $url);
            //      curl_setopt($ch, CURLOPT_PROXY, $proxy);
            curl_setopt($ch, CURLOPT_POSTFIELDS, $requestBody);
            //      curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
            curl_setopt($ch, CURLOPT_HEADER, 1);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
            curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $requestMethod);
            curl_setopt($ch, CURLOPT_HTTPHEADER, $requestHeaders);
            $response    = curl_exec($ch);
            $header_size = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
            $rHeader     = substr($response, 0, $header_size);
            $rData       = substr($response, $header_size);
            $rError      = curl_error($ch);
            curl_close($ch);
        } else {
            $requestHeaderRaw = "Content-Type: application/json\n";
        }
		$opt = "";
        foreach($methodData as $tName=>$tSelected) {
                $opt .= sprintf("<option value='%s' %s>%s</option>", $tName, ($tSelected == 1) ? "selected" : "", $tName);
        }
		$url = htmlspecialchars($url, ENT_QUOTES, "UTF-8");
		return view('odata', ['opt' => $opt, "version" => $version, "url" =>$url,"requestHeaderRaw"=>$requestHeaderRaw,"requestBody"=>$requestBody,"rHeader"=>$rHeader,"rData"=>$rData,"rError"=>$rError]);
        
    }
}