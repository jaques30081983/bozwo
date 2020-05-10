<!DOCTYPE html>
<html lang="de">
    <head>
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
      	<meta charset="utf-8">
        <title>BoZwo</title>

		<script
		id="sap-ui-bootstrap"
		src="https://openui5.hana.ondemand.com/resources/sap-ui-core.js"
		data-sap-ui-theme="sap_belize"
		data-sap-ui-libs="sap.m"
		data-sap-ui-compatVersion="edge"
		sap-ui-xx-componentPreload=off
		data-sap-ui-preload="async"
		data-sap-ui-resourceroots='{
			"sap.ui.bw.bozwo": "./"
		}'>
      </script>
      


		@yield('header')
    </head>
    <body class="sapUiBody" id="content">
	<img id="loadingBozwo" src="images/loading.gif" alt="bozwo loading..." style="
		display: block;
		position: absolute;
		top: 50%;
  		left: 50%;
		transform: translate(-50%, -50%);
		width: 5%;
		">
		@yield('content')
    </body>
</html>