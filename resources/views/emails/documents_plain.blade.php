<?php
/*
if (! empty($greeting)) {
    echo $greeting, "\n\n";
} else {
    echo $level == 'error' ? 'Whoops!' : 'Hello!', "\n\n";
}

if (! empty($introLines)) {
    echo implode("\n", $introLines), "\n\n";
}

if (isset($actionText)) {
    echo "{$actionText}: {$actionUrl}", "\n\n";
}

if (! empty($outroLines)) {
    echo implode("\n", $outroLines), "\n\n";
}
*/
//echo"Hello, \n";
//echo $data['mailGreeting']."\n";
echo $data['mailMessage']."\n";
//echo 'Regards,', "\n";
//echo Auth::user()->name, " from ";
//echo config('app.name'), "\n";

echo"--
bigwood, Lämmle & Heinrich GbR
Bertha-Benz-Str. 10
71665 Vaihingen an der Enz

Tel. +49(0)7042/2839130
Fax. +49(0)3212/2449663

info@bigwood.de
www.bigwood.de

Vertretungsberechtigte Gesellschafter: Jakob Lämmle, Daniel Heinrich

Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz: DE226341513


Hinweis:

Der Inhalt des erhaltenen E-Mails ist vertraulich zu behandeln und nur für den Adressaten/Vertreter bestimmt.

Wir machen darauf aufmerksam, dass der E-Mail-Inhalt aus Rechts- und Sicherheitsgründen nicht rechtsverbindlich ist. Eine rechtsverbindliche Bestätigung erhalten Sie gerne auf Anfrage in schriftlicher Form. Eine Veröffentlichung, Vervielfältigung oder Weitergabe des E-Mail-Inhaltes ist nur mit unserer schriftlichen Erlaubnis gestattet. Aussagen oder Informationen an den Adressaten unterliegen dem Recht des Geschäftes, zu welchem diese erfolgten; hierbei sind die zutreffenden Allgemeinen Geschäftsbedingungen sowie individuelle Vereinbarungen zu beachten.

Sollten Sie nicht der für unsere Nachricht vorgesehene Empfänger sein, so bitten wir Sie, sich mit dem Versender dieser E-Mail umgehend in Verbindung zu setzen und anschließend die empfangene Sendung aus Ihrem System zu löschen. ";
