<?php
namespace App;


use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use \setasign\Fpdi\Fpdi;
//use Vendor\pdml\pdml;
//require_once base_path('vendor/pdml/pdml.php');

define('EUR',chr(128));

class PDF extends FPDI
{

    // Page header
    function Header()
    {
        // Logo
        //$this->Image('logo.png',10,6,30);
        // Arial bold 15
        //$this->SetFont('Arial','B',15);
        // Move to the right
        //$this->Cell(80);
        // Title
        //$this->Cell(30,10,'Title',1,0,'C');
        // Line break
        //$this->Ln(20);
        
    }
    
    // Page footer
    function Footer()
    {
        // Position at 1.5 cm from bottom
        $this->SetY(-10);
        // Arial italic 8
        $this->SetFont('Arial','I',8);
        // Page number
        $this->Cell(0,5,$this->PageNo().'/{nb}',0,0,'R');
    }
    
    
    var $widths;
    var $aligns;
    
    function SetWidths($w)
    {
        //Set the array of column widths
        $this->widths=$w;
    }
    
    function SetAligns($a)
    {
        //Set the array of column alignments
        $this->aligns=$a;
    }
    
    function Row($data,$tplIdx2,$pdml,$type)
    {
        //Calculate the height of the row
        $nb=0;
        for($i=0;$i<count($data);$i++)
            //var_dump($this->widths[$i]);
            //var_dump($data[$i]);
      
            $nb=max($nb,$this->NbLines($this->widths[$i],$data[$i]));

            $h=5*$nb;
            //Issue a page break first if needed 
            $this->CheckPageBreak($h,$tplIdx2,$pdml);
            if($type == 0){
                $this->SetFont('Arial', 'B', 10);
            }elseif($type == 9){
                $this->SetFont('Arial', 'B', 8);
            }else{
                $this->SetFont('Arial', '', 8);
            }
            //Draw the cells of the row
            for($i=0;$i<count($data);$i++)
            {
                
                $w=$this->widths[$i];
    
                
                $a=isset($this->aligns[$i]) ? $this->aligns[$i] : 'L';
                //Save the current position
                $x=$this->GetX();
                $y=$this->GetY();
                //Draw the border
                ////$this->Rect($x,$y,$w,$h);
                //Print the text
                $this->MultiCell($w,4,$data[$i],0,$a);
                //Put the position to the right of the cell
                $this->SetXY($x+$w,$y);
            }
            //Go to the next line
            $this->Ln($h);
    }
    
    function CheckPageBreak($h,$tplIdx2,$pdml)
    {
        //If the height h would cause an overflow, add a new page immediately
        if($this->GetY()+$h>$this->PageBreakTrigger){
            $this->AddPage($this->CurOrientation);
            $this->useTemplate($tplIdx2, 0, 0, 210);
            $this->_parsePDML(iconv("UTF-8", "ISO-8859-1", $pdml));
            $this->SetY(35);
            
            /*
            //Table Header
            $this->SetWidths(array(12,15,45,21,12,8,21,12,8,18));
            $this->SetAligns(array('L','L','L','R','R','L','L','L','L','R'));
            $this->SetFont('Arial', 'B', 8);
            $this->Row(array(
                'Pos',
                'Art.Nr.',
                'Bezeichnung',
                'Preis',
                'Menge',
                'ME',
                'Datum',
                'Tage',
                'f',
                'Summe'
            ),'','');
            $this->SetFont('Arial', '', 8);
            $this->SetLineWidth(0.1);
            $this->Line(20, $this->GetY()-1, 190, $this->GetY()-1);
            */
            
        }
    }
    
    function NbLines($w,$txt)
    {
        //Computes the number of lines a MultiCell of width w will take
        $cw=&$this->CurrentFont['cw'];
        if($w==0)
            $w=$this->w-$this->rMargin-$this->x;
            $wmax=($w-2*$this->cMargin)*1000/$this->FontSize;
            $s=str_replace("\r",'',$txt);
            $nb=strlen($s);
            if($nb>0 and $s[$nb-1]=="\n")
                $nb--;
                $sep=-1;
                $i=0;
                $j=0;
                $l=0;
                $nl=1;
                while($i<$nb)
                {
                    $c=$s[$i];
                    if($c=="\n")
                    {
                        $i++;
                        $sep=-1;
                        $j=$i;
                        $l=0;
                        $nl++;
                        continue;
                    }
                    if($c==' ')
                        $sep=$i;
                        $l+=$cw[$c];
                        if($l>$wmax)
                        {
                            if($sep==-1)
                            {
                                if($i==$j)
                                    $i++;
                            }
                            else
                                $i=$sep+1;
                                $sep=-1;
                                $j=$i;
                                $l=0;
                                $nl++;
                        }
                        else
                            $i++;
                }
                return $nl;
    }
    
    ///////PDML///////
    var $parserState=0;
    var $final;             // final PDF output.
    var $inPage = false;    // are we in a page yet?
    var $anchors = array(); // map anchor names to internal ids.
    var $href = array();    // stack of current URLs to link to. (shift/unshift)
    var $href_style = array(); // should links be underlined blue? 0/1
    var $font_color = array("000000");   // current text color
    var $font_size  = array("10");   // current font size
    var $font_face  = array("Helvetica");   // current font name
    var $font_mask  = array(); // keep track of stuff so that </font> works right.
    var $B = 0;
    var $I = 0;
    var $U = 0;
    var $top_margin = array( 28.35 ); // 1cm
    var $left_margin = array( 28.35 ); // 1cm
    var $right_margin = array( 28.35 ); // 1cm
    var $bottom_margin = array( 28.35 ); // 1cm
    var $div_x = array();
    var $div_y = array();
    var $cell_info; // stuff to keep around until a </cell> shows up
    var $cell_text; // text to put in a cell.
    var $script;    // stuff to put in our script.
    var $header='';
    var $footer='';
    var $parserBreak; // when you want to break parsing, put a stop word here.
    var $multicol = array(); // stack of columns. you never know.
    
    /* Rotation extension. Should go away with 1.6 */
    var $angle=0;
    function Rotate($angle,$x=-1,$y=-1)
    {
        if($x==-1)
            $x=$this->x;
            if($y==-1)
                $y=$this->y;
                if($this->angle!=0)
                    $this->_out('Q');
                    $this->angle=$angle;
                    if($angle!=0)
                    {
                        $angle*=M_PI/180;
                        $c=cos($angle);
                        $s=sin($angle);
                        $cx=$x*$this->k;
                        $cy=($this->h-$y)*$this->k;
                        $this->_out(sprintf('q %.5f %.5f %.5f %.5f %.2f %.2f cm 1 0 0 1 %.2f %.2f cm',$c,   $s,-$s,$c,$cx,$cy,-$cx,-$cy));
                    }
    }
    function _endpage()
    {
        if($this->angle!=0)
        {
            $this->angle=0;
            $this->_out('Q');
        }
        parent::_endpage();
    }
    /* End of Rotation Extension */
    
    /* Ellipse extension. Should go away with 1.6 */
    function Circle($x,$y,$r,$style='') {
        $this->Ellipse($x,$y,$r,$r,$style);
    }
    
    function Ellipse($x,$y,$rx,$ry,$style='D') {
        if($style=='F')
            $op='f';
            elseif($style=='FD' or $style=='DF')
            $op='B';
            else
                $op='S';
                $lx=4/3*(M_SQRT2-1)*$rx;
                $ly=4/3*(M_SQRT2-1)*$ry;
                $k=$this->k;
                $h=$this->h;
                $this->_out(sprintf('%.2f %.2f m %.2f %.2f %.2f %.2f %.2f %.2f c',
                    ($x+$rx)*$k,($h-$y)*$k,
                    ($x+$rx)*$k,($h-($y-$ly))*$k,
                    ($x+$lx)*$k,($h-($y-$ry))*$k,
                    $x*$k,($h-($y-$ry))*$k));
                $this->_out(sprintf('%.2f %.2f %.2f %.2f %.2f %.2f c',
                    ($x-$lx)*$k,($h-($y-$ry))*$k,
                    ($x-$rx)*$k,($h-($y-$ly))*$k,
                    ($x-$rx)*$k,($h-$y)*$k));
                $this->_out(sprintf('%.2f %.2f %.2f %.2f %.2f %.2f c',
                    ($x-$rx)*$k,($h-($y+$ly))*$k,
                    ($x-$lx)*$k,($h-($y+$ry))*$k,
                    $x*$k,($h-($y+$ry))*$k));
                $this->_out(sprintf('%.2f %.2f %.2f %.2f %.2f %.2f c %s',
                    ($x+$lx)*$k,($h-($y+$ry))*$k,
                    ($x+$rx)*$k,($h-($y+$ly))*$k,
                    ($x+$rx)*$k,($h-$y)*$k,
                    $op));
    }
    /* End of Ellipse Extension */
    
    /* Javascript extension. That may stick here a while. */
    var $javascript;
    var $n_js;
    function IncludeJS($script) {
        $this->javascript.=$script;
    }
    function _putjavascript() {
        $this->_newobj();
        $this->n_js=$this->n;
        $this->_out('<<');
        $this->_out('/Names [(EmbeddedJS) '.($this->n+1).' 0 R ]');
        $this->_out('>>');
        $this->_out('endobj');
        $this->_newobj();
        $this->_out('<<');
        $this->_out('/S /JavaScript');
        $this->_out('/JS '.$this->_textstring($this->javascript));
        $this->_out('>>');
        $this->_out('endobj');
    }
    function _putresources() {
        parent::_putresources();
        if (!empty($this->javascript)) {
            $this->_putjavascript();
        }
        $this->_putbookmarks();
    }
    function _putcatalog() {
        parent::_putcatalog();
        if (isset($this->javascript)) {
            $this->_out('/Names <</JavaScript '.($this->n_js).' 0 R>>');
        }
        if(count($this->outlines)>0)
        {
            $this->_out('/Outlines '.$this->OutlineRoot.' 0 R');
            $this->_out('/PageMode /UseOutlines');
        }
    }
    /* End of Javascript Extension */
    
    /* Bookmark Extension. Should go away with 1.6 */
    var $outlines=array();
    var $OutlineRoot;
    function Bookmark($txt,$level=0,$y=0)
    {
        if($y==-1)
            $y=$this->GetY();
            $this->outlines[]=array('t'=>$txt,'l'=>$level,'y'=>$y,'p'=>$this->PageNo());
    }
    function _putbookmarks()
    {
        $nb=count($this->outlines);
        if($nb==0)
            return;
            $lru=array();
            $level=0;
            foreach($this->outlines as $i=>$o)
            {
                if($o['l']>0)
                {
                    $parent=$lru[$o['l']-1];
                    //Set parent and last pointers
                    $this->outlines[$i]['parent']=$parent;
                    $this->outlines[$parent]['last']=$i;
                    if($o['l']>$level)
                    {
                        //Level increasing: set first pointer
                        $this->outlines[$parent]['first']=$i;
                    }
                }
                else
                    $this->outlines[$i]['parent']=$nb;
                    if($o['l']<=$level and $i>0)
                    {
                        //Set prev and next pointers
                        $prev=$lru[$o['l']];
                        $this->outlines[$prev]['next']=$i;
                        $this->outlines[$i]['prev']=$prev;
                    }
                    $lru[$o['l']]=$i;
                    $level=$o['l'];
            }
            //Outline items
            $n=$this->n+1;
            foreach($this->outlines as $i=>$o)
            {
                $this->_newobj();
                $this->_out('<</Title '.$this->_textstring($o['t']));
                $this->_out('/Parent '.($n+$o['parent']).' 0 R');
                if(isset($o['prev']))
                    $this->_out('/Prev '.($n+$o['prev']).' 0 R');
                    if(isset($o['next']))
                        $this->_out('/Next '.($n+$o['next']).' 0 R');
                        if(isset($o['first']))
                            $this->_out('/First '.($n+$o['first']).' 0 R');
                            if(isset($o['last']))
                                $this->_out('/Last '.($n+$o['last']).' 0 R');
                                $this->_out(sprintf('/Dest [%d 0 R /XYZ 0 %.2f null]',1+2*$o['p'],($this->h-$o['y'])*$this->k));
                                $this->_out('/Count 0>>');
                                $this->_out('endobj');
            }
            //Outline root
            $this->_newobj();
            $this->OutlineRoot=$this->n;
            $this->_out('<</Type /Outlines /First '.$n.' 0 R');
            $this->_out('/Last '.($n+$lru[0]).' 0 R>>');
            $this->_out('endobj');
    }
    /* End of Bookmark Extension */
    
    /*
    function ParsePDML($pdml) {
        // default font.
        $this->SetFont($this->font_face[0],'',$this->font_size[0]);
        // apply margins
        $this->SetRightMargin($this->right_margin[0]);
        $this->SetLeftMargin($this->left_margin[0]);
        // bottom margin
        $this->SetAutoPageBreak(true, $this->bottom_margin[0]);
        
        $this->AliasNbPages('&pagecount;');
        
        $this->_parsePDML($pdml);
        //return $this->final;
    }
    
    function Header() {
        $this->_parsePDML($this->header);
    }
    
    function Footer() {
        $this->_parsePDML($this->footer);
    }
    
    function AcceptPageBreak() {
        if (count($this->multicol)>0) {
            // we need: starting y0, col_width, col_spacing, columns, height, break=page/line
            list($x0, $y0, $width, $height, $spacing, $break, $cols, $current) = $this->multicol[0];
            if ($current<$cols-1) {
                // next column
                $current++;
                $this->multicol[0][7] = $current;
                $x = $x0 + $current * $width;
                $this->SetLeftMargin($x);
                $this->SetX($x);
                $this->SetY($y0);
                return false;
            } else {
                // ok. we need to break.
                $this->SetLeftMargin($x0);
                $this->SetX($x0);
                $this->multicol[0][7] = 0; // $current
                if ($break=="line") {
                    $y0 += $spacing + $height; // y0
                    $this->multicol[0][1] = $y0;
                    $this->SetAutoPageBreak(true, $this->hPt - ( $y0 + $height));
                    $this->SetY($y0);
                    //$this->Write(10,"This sux0rs.");
                    return false;
                } else {
                    // page break.
                    return true;
                }
            }
        } else {
            // no multi-column tag. do the normal thing.
            return true;
        }
    }
    */
    function _parsePDML($pdml) {
        $a = preg_split('/<([^<]*)\/?>/U',$pdml,-1,PREG_SPLIT_DELIM_CAPTURE);
        foreach ($a as $i=>$e) {
            if ($this->parserBreak) {
                if ($i%2==0) {
                    $this->ProcessText($e);
                    continue;
                }
                if (strcasecmp($e,$this->parserBreak)) {
                    $this->ProcessText('<'.$e.'>');
                    continue;
                }
            }
            if ($i%2==0) {
                // text
                
                $this->ProcessText(pdml_entity_decode(preg_replace(
                    array(
                        '/\s+/',
                        '/&pagenumber;/',
                        '/&pagecount;/',
                        '/&title;/',
                        '/&author;/',
                        '/&subject;/',
                        '/&creator;/'
                    ),
                    array(
                        ' ',
                        $this->PageNo(),
                        '{nb}',
                        '',
                        '',
                        '',
                        ''
                    ) ,$e)));
                    
            } else {
                // tag
                if ($e{0}=='/') {
                    $this->CloseTag(strtoupper(substr($e,1)));
                } else {
                    $a2 = explode(' ',$e,2);
                    $tag = strtoupper(array_shift($a2));
                    $e = substr($e, strlen($tag)+1);
                    // stolen from http://www.cs.sfu.ca/~cameron/REX.html
                    // bugified into uselessness. It's the intent that counts. right?
                    $NameStrt = "[A-Za-z_:]|[^\\x00-\\x7F]";
                    $NameChar = "[A-Za-z0-9_:.-]|[^\\x00-\\x7F]";
                    $Name = "(?:$NameStrt)(?:$NameChar)*";
                    $S = "[ \\n\\t\\r]+";
                    $AttValSE = "\"[^\"]*\"|'[^']*'|[^ \\n\\t\\r]+";
                    $ElemTagCE = "($Name)(?:$S)?=(?:$S)?($AttValSE)";
                    
                    $attr = array();
                    preg_match_all("/$ElemTagCE/", $e, $matches, PREG_SET_ORDER);
                    for ($i=0;$i<count($matches);$i++) {
                        $val = $matches[$i][2];
                        if ((($val{0}=='"') and (substr($val,-1)=='"')) or
                        (($val{0}=="'") and (substr($val,-1)=="'")) ){
                            $val = substr($val, 1, strlen($val)-2);
                        }
                        $attr[strtoupper($matches[$i][1])] = $val;
                    }
                    $this->OpenTag($tag,$attr);
                }
            }
        }
    }
    
    function ProcessText($text) {
        switch ($this->parserState) {
            case 0:
            case 1:
            case 2:
                // ignore text/whitespace in there.
                break;
            case 3:
                $this->SetTitle($text);
                break;
            case 4:
                $this->SetSubject($text);
                break;
            case 5:
                $this->SetAuthor($text);
                break;
            case 6:
                $this->SetKeywords($text);
                break;
            case 51:
                $this->cell_text .= $text;
                break;
            case 10:
                $this->script .= $text;
                break;
            case 63:
                $this->header .= $text;
                break;
            case 64:
                $this->footer .= $text;
                break;
            default:
                // ignore pure whitespace
                if (preg_match("/^[ \\n\\t\\r]*$/",$text)) break;
                // auto-create a page if needed.
                if (!$this->inPage) {
                    //$this->inPage = true;
                    //$this->AddPage();
                }
                // write stuff.
                // do we have a link to use?
                if (sizeof($this->href)>0) {
                    if ($this->href_style[0]) {
                        $this->SetTextColor(0,0,255);
                        $this->_setStyle('U',true, true);
                    }
                    $this->Write($this->font_size[0],$text,$this->href[0]);
                    if ($this->href_style[0]) {
                        $this->_setStyle('U', $this->U>0, true);
                        $this->_setFontColor($this->font_color[0]);
                    }
                } else {
                    $this->Write($this->font_size[0],$text);
                }
        }
    }
    
    function OpenTag($tag, $attr) {
        switch ($tag) {
            case "PDML":
                $this->_enforceState(0,1);
                break;
            case "HEAD":
                $this->_enforceState(1,2);
                break;
            case "TITLE":
                $this->_enforceState(2,3);
                break;
            case "SUBJECT":
                $this->_enforceState(2,4);
                break;
            case "AUTHOR":
                $this->_enforceState(2,5);
                break;
            case "KEYWORDS":
                $this->_enforceState(2,6);
                break;
            case "SCRIPT":
                $this->_enforceState(2,10);
                $this->script='';
                $this->parserBreak="/script";
                break;
            case "BODY":
                $this->_enforceState(1,50);
                break;
            case "PAGE":
                $this->_enforceState(50,50);
                $o = "P";
                if (isset($attr["ORIENTATION"])) {
                    if (strcasecmp($attr["ORIENTATION"],"LANDSCAPE")==0) {
                        $o = "L";
                    }
                }
                if (isset($attr["TOP"])) {
                    $this->top_margin[0] = $attr["TOP"];
                    $this->SetTopMargin($this->top_margin[0]);
                }
                if (isset($attr["LEFT"])) {
                    $this->left_margin[0] = $attr["LEFT"];
                    $this->SetLeftMargin($this->left_margin[0]);
                }
                if (isset($attr["RIGHT"])) {
                    $this->right_margin[0] = $attr["RIGHT"];
                    $this->SetRightMargin($this->right_margin[0]);
                }
                $this->inPage=true;
                $this->AddPage($o);
                if (isset($attr["BOTTOM"])) {
                    $this->bottom_margin[0] = $attr["BOTTOM"];
                    $this->SetAutoPageBreak(true, $this->bottom_margin[0]);
                }
                if (isset($attr["BORDER"])) {
                    $this->SetLineWidth($attr["BORDER"]);
                    $this->Rect($this->lMargin, $this->tMargin, ($this->w-$this->rMargin-$this->lMargin), ($this->h-$this->bMargin-$this->tMargin));
                }
                break;
            case "BR":
                
                // auto-create a page if needed.
                if (!$this->inPage) {
                    //$this->inPage = true;
                    //$this->AddPage();
                }
                // no enforcement.
                if ($this->parserState==51) {
                    $this->cell_text.="\n";
                    break;
                }
                if (isset($attr["HEIGHT"])) {
                    $h=$this->_getUnit($attr["HEIGHT"], $this->font_size[0]);
                    $this->Ln($h);
                    
                } else {
                    $this->Ln($this->font_size[0]);
                    
                }
                
                break;
            case "A":
                $this->_enforceState(50,50);
                // auto-create a page if needed.
                if (!$this->inPage) {
                    $this->inPage = true;
                    $this->AddPage();
                }
                // name=
                if (isset($attr["NAME"])) {
                    // local anchor
                    $name = $attr["NAME"];
                    if (!isset($this->anchors[$name])) {
                        $this->anchors[$name] = $this->AddLink();
                    }
                    $this->SetLink($this->anchors[$name], -1);
                }
                // href=
                if (isset($attr["HREF"])) {
                    $href = $attr["HREF"];
                    if ($href[0]=='#') {
                        // local anchor
                        $href = substr($href,1);
                        if (!isset($this->anchors[$href])) {
                            $this->anchors[$href] = $this->AddLink();
                        }
                        array_unshift ($this->href, $this->anchors[$href]);
                    } else {
                        array_unshift ($this->href, $href);
                    }
                    // we should set style to underlined blue. XXX
                    array_unshift ($this->href_style, isset($attr["HIDDEN"])?0:1);
                }
                break;
            case "B":
            case "I":
            case "U":
                $this->_enforceState(50,50);
                $this->_setStyle($tag, true);
                break;
            case "FONT":
                $this->_enforceState(50,50);
                $mask = 0;
                if (isset($attr["COLOR"])) {
                    // hex-encoded color. no space for long color name list.
                    $color = $this->_TranslateColor($attr["COLOR"]);
                    array_unshift($this->font_color, $color);
                    $this->_setFontColor($color);
                    $mask |= 1;
                }
                if (isset($attr["SIZE"])) {
                    $size = $this->_getUnit($attr["SIZE"], $this->font_size[0]);
                    array_unshift($this->font_size, $size);
                    $this->SetFontSize($size);
                    $mask |= 2;
                }
                if (isset($attr["FACE"])) {
                    $face = $attr["FACE"];
                    array_unshift($this->font_face, $face);
                    $this->_setFontFace($face);
                    $mask |= 4;
                }
                array_unshift($this->font_mask, $mask);
                break;
            case "IMG":
                $this->_enforceState(50,50);
                // auto-create a page if needed.
                if (!$this->inPage) {
                    $this->inPage = true;
                    $this->AddPage();
                }
                if (!isset($attr["SRC"])) break;
                $src = $attr["SRC"];
                $x = $this->GetX();
                if (isset($attr["LEFT"])) {
                    $x = $this->_getUnit($attr["LEFT"], $this->wPt);
                }
                $y = $this->GetY();
                if (isset($attr["TOP"])) {
                    $y = $this->_getUnit($attr["TOP"], $this->hPt);
                }
                $width = 0;
                if (isset($attr["WIDTH"])) {
                    $width = $this->_getUnit($attr["WIDTH"], $this->wPt);
                }
                $height = 0;
                if (isset($attr["HEIGHT"])) {
                    $height = $this->_getUnit($attr["HEIGHT"], $this->hPt);
                }
                // try to resolve src a bit if necessary.
                if (!@file_exists($src)) {
                    $src1 = getenv("DOCUMENT_ROOT")."/".$src;
                    $src2 = dirname(getenv("SCRIPT_FILENAME"))."/".$src;
                    if (file_exists($src1)) {
                        $src = $src1;
                    } elseif (file_exists($src2)) {
                        $src = $src2;
                    }
                }
                if (sizeof($this->href)>0) {
                    $this->Image($src, $x, $y, $width, $height, '', $this->href[0]);
                } else {
                    $this->Image($src, $x, $y, $width, $height);
                }
                break;
            case "LINE":
                $this->_enforceState(50,50);
                // auto-create a page if needed.
                if (!$this->inPage) {
                    $this->inPage = true;
                    $this->AddPage();
                }
                $x1 = $this->GetX();
                $y1 = $this->GetY();
                if (isset($attr["FROM"])) {
                    list($x1,$y1) = explode(',',$attr["FROM"]);
                    $x1 = $this->_getUnit($x1, $this->wPt);
                    $y1 = $this->_getUnit($y1, $this->hPt);
                }
                $x2 = $this->w-$this->rMargin;
                $y2 = $y1;
                if (isset($attr["TO"])) {
                    list($x2,$y2) = explode(',',$attr["TO"]);
                    $x2 = $this->_getUnit($x2, $this->wPt);
                    $y2 = $this->_getUnit($y2, $this->hPt);
                }
                $color = "000000";
                if (isset($attr["COLOR"])) {
                    $color = $this->_TranslateColor($attr["COLOR"]);
                }
                $lwidth = $this->_getUnit("0.2mm");
                if (isset($attr["WIDTH"])) {
                    $lwidth = $this->_getUnit($attr["WIDTH"], $lwidth);
                }
                $this->_setLineColor($color);
                $this->SetLineWidth($lwidth);
                $this->Line($x1,$y1,$x2,$y2);
                break;
            case "RECT":
                $this->_enforceState(50,50);
                // auto-create a page if needed.
                if (!$this->inPage) {
                    $this->inPage = true;
                    $this->AddPage();
                }
                $x1 = $this->GetX();
                $y1 = $this->GetY();
                if (isset($attr["FROM"])) {
                    list($x1,$y1) = explode(',',$attr["FROM"]);
                    $x1 = $this->_getUnit($x1, $this->w-$this->rMargin);
                    $y1 = $this->_getUnit($y1, $$this->h-$this->bMargin);
                }
                if (isset($attr["LEFT"])) {
                    $x1 = $this->_getUnit($attr["LEFT"], $this->w-$this->rMargin);
                }
                if (isset($attr["TOP"])) {
                    $y1 = $this->_getUnit($attr["TOP"], $this->h-$this->bMargin);
                }
                $width= $this->w-$this->rMargin-$x1;
                $height= 36;
                if (isset($attr["TO"])) {
                    list($x2,$y2) = explode(',',$attr["TO"]);
                    $x2 = $this->_getUnit($x2, $this->w-$this->rMargin);
                    $y2 = $this->_getUnit($y2, $this->h-$this->bMargin);
                    $width  = $x2-$x1+1;
                    $height = $y2-$y1+1;
                }
                if (isset($attr["WIDTH"])) {
                    $width = $this->_getUnit($attr["WIDTH"], $this->w-$this->rMargin-$x1);
                }
                if (isset($attr["HEIGHT"])) {
                    $height = $this->_getUnit($attr["HEIGHT"], $this->h-$this->bMargin-$y1);
                }
                $style="";
                $color = "000000";
                if (isset($attr["COLOR"])) {
                    $color = $this->_TranslateColor($attr["COLOR"]);
                    $style.="D";
                }
                $fill = "000000";
                if (isset($attr["FILLCOLOR"])) {
                    $fill = $this->_TranslateColor($attr["FILLCOLOR"]);
                    $style.="F";
                }
                $border = $this->_getUnit("0.2mm");
                if (isset($attr["BORDER"])) {
                    $border = $this->_getUnit($attr["BORDER"], $border);
                }
                $this->_setLineColor($color);
                $this->SetLineWidth($border);
                $this->_setRectColor($fill);
                $this->Rect($x1,$y1,$width,$height,$style);
                break;
            case "CIRCLE":
            case "ELLIPSE":
                $this->_enforceState(50,50);
                // auto-create a page if needed.
                if (!$this->inPage) {
                    $this->inPage = true;
                    $this->AddPage();
                }
                $x1 = $this->GetX();
                $y1 = $this->GetY();
                if (isset($attr["FROM"])) {
                    list($x1,$y1) = explode(',',$attr["FROM"]);
                    $x1 = $this->_getUnit($x1, $this->wPt);
                    $y1 = $this->_getUnit($y1, $this->hPt);
                }
                $radius = $this->_getAttrUnit($this->font_size[0], $attr, "RADIUS", $this->font_size[0]);
                $xradius = $this->_getAttrUnit($radius, $attr, "XRADIUS", $this->font_size[0]);
                $yradius = $this->_getAttrUnit($radius, $attr, "YRADIUS", $this->font_size[0]);
                $style="";
                $color = "000000";
                if (isset($attr["COLOR"])) {
                    $color = $this->_TranslateColor($attr["COLOR"]);
                    $style.="D";
                }
                $fill = "000000";
                if (isset($attr["FILLCOLOR"])) {
                    $fill = $this->_TranslateColor($attr["FILLCOLOR"]);
                    $style.="F";
                }
                $border = $this->_getUnit("0.2mm");
                if (isset($attr["BORDER"])) {
                    $border = $this->_getUnit($attr["BORDER"], $border);
                }
                $this->_setLineColor($color);
                $this->SetLineWidth($border);
                $this->_setRectColor($fill);
                $this->Ellipse($x1, $y1, $xradius, $yradius, $style);
                break;
            case "DIV":
                $this->_enforceState(50,50);
                // auto-create a page if needed.
                if (!$this->inPage) {
                    $this->inPage = true;
                    $this->AddPage();
                }
                $save_x = $this->GetX();
                $x = $this->_getAttrUnit($save_x, $attr, "LEFT", $this->wPt);
                $save_y = $this->GetY();
                $y = $this->_getAttrUnit($save_y, $attr, "TOP", $this->hPt);
                $width = $this->_getAttrUnit($this->wPt-$x, $attr, "WIDTH", $this->wPt);
                $height = $this->_getAttrUnit($this->hPt-$y, $attr, "HEIGHT", $this->hPt);
                if ($x == $save_x) { $save_x+=$width; }
                array_unshift($this->left_margin, $x);
                array_unshift($this->right_margin, $this->wPt-$width-$x);
                array_unshift($this->div_x, $save_x);
                array_unshift($this->div_y, $save_y);
                // draw a rect, just to debug. XXX
                $style="";
                $color = "000000";
                if (isset($attr["COLOR"])) {
                    $color = $this->_TranslateColor($attr["COLOR"]);
                    $style.="D";
                }
                $fill = "000000";
                if (isset($attr["FILLCOLOR"])) {
                    $fill = $this->_TranslateColor($attr["FILLCOLOR"]);
                    $style.="F";
                }
                $border = $this->_getUnit("0.2mm");
                if (isset($attr["BORDER"])) {
                    $border = $this->_getUnit($attr["BORDER"], $border);
                }
                $this->_setLineColor($color);
                $this->SetLineWidth($border);
                $this->_setRectColor($fill);
                if ($style) {
                    $this->Rect($x,$y,$width,$height,$style);
                }
                $this->SetLeftMargin($this->left_margin[0]);
                $this->SetRightMargin($this->right_margin[0]);
                $this->SetXY($x,$y);
                break;
            case "MULTICELL":
            case "CELL":
                $this->_enforceState(50,51);
                // auto-create a page if needed.
                if (!$this->inPage) {
                    //$this->inPage = true;
                    //$this->AddPage();
                }
                $save_x = $this->GetX();
                $x = $this->_getAttrUnit($save_x, $attr, "LEFT", $this->wPt);
                $save_y = $this->GetY();
                $y = $this->_getAttrUnit($save_y, $attr, "TOP", $this->hPt);
                $width = $this->_getAttrUnit($this->wPt-$x, $attr, "WIDTH", $this->wPt);
                // used by multicell only
                $inter = $this->_getAttrUnit($this->font_size[0], $attr, "INTER", $this->font_size[0]);
                // used by cell only.
                $height = $this->_getAttrUnit($this->font_size[0], $attr, "HEIGHT", $this->font_size[0]);
                $next = 0;
                if (isset($attr["NEXT"])) {
                    $n = strtolower($attr["NEXT"]);
                    switch ($n) {
                        case "right": $next =0; break;
                        case "bottom": case "down": $next=2; break;
                        case "break": $next = 1; break;
                    }
                }
                $style="";
                $color = "000000";
                if (isset($attr["COLOR"])) {
                    $color = $this->_TranslateColor($attr["COLOR"]);
                    $style.="D";
                }
                $fillflag = 0;
                $fill = "000000";
                if (isset($attr["FILLCOLOR"])) {
                    $fill = $this->_TranslateColor($attr["FILLCOLOR"]);
                    $fillflag=1;
                }
                $borderflag=0;
                $border = $this->_getUnit("0.2mm");
                if (isset($attr["BORDER"])) {
                    $border = $this->_getUnit($attr["BORDER"], $border);
                    $borderflag=1;
                }
                $align = ($tag=="CELL")?"L":"J";
                if (isset($attr["ALIGN"])) {
                    $al = strtolower($attr["ALIGN"]);
                    switch ($al){
                        case "left": $align="L"; break;
                        case "center": $align="C"; break;
                        case "right": $align="R"; break;
                        case "justify": $align="J"; break;
                    }
                }
                $this->_setLineColor($color);
                $this->SetLineWidth($border);
                $this->_setRectColor($fill);
                $this->SetXY($x,$y);
                $this->cell_info = array($width, $inter, $height, $borderflag, $align, $fillflag, $next);
                $this->cell_text = '';
                break;
            case "ROTATE":
                $angle=45;
                if (isset($attr["ANGLE"])) {
                    $angle = $attr["ANGLE"];
                }
                $x=-1;
                $y=-1;
                if (isset($attr["CENTER"])) {
                    list($x,$y) = explode(',',$attr["CENTER"]);
                    $x = $this->_getUnit($x, $this->wPt);
                    $y = $this->_getUnit($y, $this->hPt);
                }
                $this->rotate($angle, $x, $y);
                break;
            case "BOOKMARK":
                if (!isset($attr["TITLE"])) break;
                $title = $attr["TITLE"];
                $level = 0;
                if (isset($attr["LEVEL"])) {
                    $level = $attr["LEVEL"];
                }
                $top = -1;
                if (isset($attr["TOP"])) {
                    $top = $this->_getUnit($attr["TOP"], $this->hPt);
                }
                $this->Bookmark($title, $level, $top);
                break;
            case "HEADER":
                $this->_enforceState(50,63);
                $this->header='';
                $this->parserBreak='/header';
                break;
            case "FOOTER":
                $this->_enforceState(50,64);
                $this->footer='';
                $this->parserBreak='/footer';
                break;
            case "COLUMN":
                $this->_enforceState(50,50);
                // auto-create a page if needed.
                if (!$this->inPage) {
                    $this->inPage = true;
                    $this->AddPage();
                }
                $save_x = $this->GetX();
                $x = $this->_getAttrUnit($save_x, $attr, "LEFT", $this->wPt);
                $save_y = $this->GetY();
                $y = $this->_getAttrUnit($save_y, $attr, "TOP", $this->hPt);
                $count = 2;
                if (isset($attr["COUNT"])) {
                    $count = (int)$attr["COUNT"];
                }
                $width = $this->_getAttrUnit(($this->wPt-$x)/$count, $attr, "WIDTH", $this->wPt);
                $height = $this->_getAttrUnit($this->hPt-$y, $attr, "HEIGHT", $this->hPt);
                $spacing = $this->_getAttrUnit($this->font_size[0], $attr, "SPACING", $this->font_size[0]);
                $break = "page";
                if (isset($attr["BREAK"]) and (strtolower($attr["BREAK"])=="line")) {
                    $break = "line";
                }
                // store stuff for acceptPageBreak to make sense of, and stuff we're saving
                array_unshift($this->multicol, array($x,$y,$width,$height,$spacing, $break, $count, 0, ));
                array_unshift($this->left_margin, $x);
                array_unshift($this->bottom_margin, $this->hPt-($y+$height));
                // set margins to make things work.
                $this->SetLeftMargin($this->left_margin[0]);
                $this->SetAutoPageBreak(true, $this->bottom_margin[0]);
                break;
            case "BARCODE":
                $this->_enforceState(50,51);
                // auto-create a page if needed.
                if (!$this->inPage) {
                    $this->inPage = true;
                    $this->AddPage();
                }
                $save_x = $this->GetX();
                $x = $this->_getAttrUnit($save_x, $attr, "LEFT", $this->wPt);
                $save_y = $this->GetY();
                $y = $this->_getAttrUnit($save_y, $attr, "TOP", $this->hPt);
                $width = $this->_getAttrUnit($this->wPt-$x, $attr, "WIDTH", $this->wPt);
                // used by multicell only
                $inter = $this->_getAttrUnit($this->font_size[0], $attr, "INTER", $this->font_size[0]);
                // used by cell only.
                $height = $this->_getAttrUnit($this->font_size[0], $attr, "HEIGHT", $this->font_size[0]);
                $next = 0;
                if (isset($attr["NEXT"])) {
                    $n = strtolower($attr["NEXT"]);
                    switch ($n) {
                        case "right": $next =0; break;
                        case "bottom": case "down": $next=2; break;
                        case "break": $next = 1; break;
                    }
                }
                $style="";
                $color = "000000";
                if (isset($attr["COLOR"])) {
                    $color = $this->_TranslateColor($attr["COLOR"]);
                    $style.="D";
                }
                $fillflag = 0;
                $fill = "000000";
                if (isset($attr["BASELINE"])) {
                    $baseline = $attr["BASELINE"];
                }else{
                    $baseline = "0.5";
                }
                
                if (isset($attr["RATIO"])) {
                    $ratio = $attr["RATIO"];
                }else{
                    $ratio = "2";
                }
                
                $borderflag=0;
                $border = $this->_getUnit("0.2mm");
                if (isset($attr["BORDER"])) {
                    $border = $this->_getUnit($attr["BORDER"], $border);
                    $borderflag=1;
                }
                $align = ($tag=="CELL")?"L":"J";
                if (isset($attr["ALIGN"])) {
                    $al = strtolower($attr["ALIGN"]);
                    switch ($al){
                        case "left": $align="L"; break;
                        case "center": $align="C"; break;
                        case "right": $align="R"; break;
                        case "justify": $align="J"; break;
                    }
                }
                $this->_setLineColor($color);
                $this->SetLineWidth($border);
                $this->_setRectColor($fill);
                $this->SetXY($x,$y);
                //$this->cell_info = array($width, $inter, $height, $borderflag, $align, $fillflag, $next);
                $this->cell_info = array($x, $inter, $y, $height, $align, $fillflag, $baseline, $ratio);
                $this->cell_text = '';
                break;
        }
    }
    
    function CloseTag($tag) {
        switch ($tag) {
            case "PDML":
                $this->_enforceState(1,0);
                //$this->final = $this->Output("","S");
                break;
            case "HEAD":
                $this->_enforceState(2,1);
                break;
            case "TITLE":
                $this->_enforceState(3,2);
                break;
            case "SUBJECT":
                $this->_enforceState(4,2);
                break;
            case "AUTHOR":
                $this->_enforceState(5,2);
                break;
            case "KEYWORDS":
                $this->_enforceState(6,2);
                break;
            case "SCRIPT":
                $this->_enforceState(10,2);
                $this->IncludeJS($this->script);
                $this->parserBreak='';
                break;
            case "BODY":
                $this->Close();
                $this->_enforceState(50,1);
                break;
            case "A":
                array_shift ($this->href);
                array_shift ($this->href_style);
                // we should remove underline + blue.
                break;
            case "B":
            case "I":
            case "U":
                $this->_setStyle($tag, false);
                break;
            case "FONT":
                if (sizeof($this->font_mask)>0) {
                    $mask = array_shift($this->font_mask);
                }
                if (($mask&1)==1) {
                    array_shift($this->font_color);
                    $this->_setFontColor($this->font_color[0]);
                }
                if (($mask&2)==2) {
                    array_shift($this->font_size);
                    $this->SetFontSize($this->font_size[0]);
                }
                if (($mask&4)==4) {
                    array_shift($this->font_face);
                    $this->_setFontFace($this->font_face[0]);
                }
                break;
            case "DIV":
                if (sizeof($this->div_x)<1) break;
                array_shift($this->left_margin);
                array_shift($this->right_margin);
                $this->SetLeftMargin($this->left_margin[0]);
                $this->SetRightMargin($this->right_margin[0]);
                $this->SetXY($this->div_x[0],$this->div_y[0]);
                array_shift($this->div_x);
                array_shift($this->div_y);
                break;
            case "MULTICELL":
                $this->_enforceState(51,50);
                $this->MultiCell(
                    $this->cell_info[0],
                    $this->cell_info[1],
                    $this->cell_text,
                    $this->cell_info[3],
                    $this->cell_info[4],
                    $this->cell_info[5]);
                break;
            case "CELL":
                $this->_enforceState(51,50);
                // redo the link logic here. blah.
                if (sizeof($this->href)>0) {
                    if ($this->href_style[0]) {
                        $this->SetTextColor(0,0,255);
                        $this->_setStyle('U',true, true);
                    }
                    $this->Cell(
                        $this->cell_info[0],
                        $this->cell_info[2],
                        $this->cell_text,
                        $this->cell_info[3],
                        $this->cell_info[6],
                        $this->cell_info[4],
                        $this->cell_info[5],
                        $this->href[0]);
                    if ($this->href_style[0]) {
                        $this->_setStyle('U', $this->U>0, true);
                        $this->_setFontColor($this->font_color[0]);
                    }
                } else {
                    $this->Cell(
                        $this->cell_info[0],
                        $this->cell_info[2],
                        $this->cell_text,
                        $this->cell_info[3],
                        $this->cell_info[6],
                        $this->cell_info[4],
                        $this->cell_info[5]);
                }
                break;
            case "ROTATE":
                $this->rotate(0);
                break;
            case "HEADER":
                $this->_enforceState(63,50);
                $this->parserBreak='';
                break;
            case "FOOTER":
                $this->_enforceState(64,50);
                $this->parserBreak='';
                break;
            case "COLUMN":
                $this->_enforceState(50,50);
                array_shift($this->multicol);
                array_shift($this->left_margin);
                array_shift($this->bottom_margin);
                $this->SetLeftMargin($this->left_margin[0]);
                $this->SetAutoPageBreak(true, $this->bottom_margin[0]);
                break;
            case "BARCODE":
                $this->_enforceState(51,50);
                $this->_Code39(
                    $this->cell_info[0],
                    $this->cell_info[2],
                    $this->cell_text,
                    $this->cell_info[6],
                    $this->cell_info[3],
                    $this->cell_info[7]);
                break;
        }
    }
    
    function _enforceState($from, $to) {
        if ($this->parserState!=$from) {
            error_log("unexpected tag (from $from to $to, but state=".$this->parserState.")");
            //$this->Write("[unexpected tag (from $from to $to)]");
        }
        $this->parserState=$to;
    }
    
    // default is pt. works good for fonts, so yeah.
    function _getUnit($str, $max=100) {
        $str=rtrim($str);
        $v=(float)$str;
        if (substr($str,-1)=='%') {
            return $max * $v / 100;
        }
        $u=substr($str,-2);
        switch ($u) {
            default:
            case "pt": $m=1; break;
            case "mm": $m=72/25.4; break;
            case "cm": $m=72/2.54; break;
            case "in": $m=72; break;
        }
        return $v * $m;
    }
    
    function _getAttrUnit($default, $attr, $name, $ref) {
        if (isset($attr[$name])) {
            return $this->_getUnit($attr[$name], $ref);
        } else {
            return $default;
        }
    }
    
    function _setStyle($tag, $enable, $forget=0) {
        $this->$tag+=($enable ? 1: -1);
        $style='';
        foreach(array('B','I','U') as $s) {
            if ($this->$s>0) {
                $style.=$s;
            }
        }
        $this->SetFont('',$style);
        if ($forget) {
            $this->$tag-=($enable ? 1: -1);
        }
    }
    
    function _setFontFace($face) {
        $style='';
        foreach(array('B','I','U') as $s) {
            if ($this->$s>0) {
                $style.=$s;
            }
        }
        $this->SetFont($face,$style);
    }
    
    function _setFontColor($hex) {
        $this->SetTextColor(
            hexdec(substr($hex,0,2)),
            hexdec(substr($hex,2,2)),
            hexdec(substr($hex,4,2)));
    }
    
    function _setLineColor($hex) {
        $this->SetDrawColor(
            hexdec(substr($hex,0,2)),
            hexdec(substr($hex,2,2)),
            hexdec(substr($hex,4,2)));
    }
    
    function _setRectColor($hex) {
        $this->SetFillColor(
            hexdec(substr($hex,0,2)),
            hexdec(substr($hex,2,2)),
            hexdec(substr($hex,4,2))
            );
    }
    
    function _TranslateColor($color) {
        $colorList = array (
            'BLACK'	=> '000000',
            'SILVER'=> 'C0C0C0',
            'GRAY'	=> '808080',
            'WHITE'	=> 'FFFFFF',
            'MAROON'=> '800000',
            'RED'	=> 'FF0000',
            'PURPLE'=> '800080',
            'FUCHSIA'=> 'FF00FF',
            'GREEN'	=> '008000',
            'LIME'	=> '00FF00',
            'OLIVE'	=> '808000',
            'YELLOW'=> 'FFFF00',
            'NAVY'	=> '000080',
            'BLUE'	=> '0000FF',
            'TEAL'	=> '008080',
            'AQUA'	=> '00FFFF'
        );
        
        $color = strtoupper($color);
        if ($color[0]=="#") {
            $hex = substr($color,1);
        } elseif (isset($colorList[$color])) {
            $hex = $colorList[$color];
        } else {
            $hex = "000000";
        }
        
        return($hex);
    }
    
    
    function _Code39($xpos, $ypos, $code, $baseline=0.5, $height=5, $ratio=2)
    {
        
        $ratio = ($ratio==3)?3.0:2.0;
        $wide = $baseline;
        $narrow = $baseline / $ratio ;
        $gap = $narrow;
        
        $barChar = array (
            '0' => 'nnnwwnwnn',
            '1' => 'wnnwnnnnw',
            '2' => 'nnwwnnnnw',
            '3' => 'wnwwnnnnn',
            '4' => 'nnnwwnnnw',
            '5' => 'wnnwwnnnn',
            '6' => 'nnwwwnnnn',
            '7' => 'nnnwnnwnw',
            '8' => 'wnnwnnwnn',
            '9' => 'nnwwnnwnn',
            'A' => 'wnnnnwnnw',
            'B' => 'nnwnnwnnw',
            'C' => 'wnwnnwnnn',
            'D' => 'nnnnwwnnw',
            'E' => 'wnnnwwnnn',
            'F' => 'nnwnwwnnn',
            'G' => 'nnnnnwwnw',
            'H' => 'wnnnnwwnn',
            'I' => 'nnwnnwwnn',
            'J' => 'nnnnwwwnn',
            'K' => 'wnnnnnnww',
            'L' => 'nnwnnnnww',
            'M' => 'wnwnnnnwn',
            'N' => 'nnnnwnnww',
            'O' => 'wnnnwnnwn',
            'P' => 'nnwnwnnwn',
            'Q' => 'nnnnnnwww',
            'R' => 'wnnnnnwwn',
            'S' => 'nnwnnnwwn',
            'T' => 'nnnnwnwwn',
            'U' => 'wwnnnnnnw',
            'V' => 'nwwnnnnnw',
            'W' => 'wwwnnnnnn',
            'X' => 'nwnnwnnnw',
            'Y' => 'wwnnwnnnn',
            'Z' => 'nwwnwnnnn',
            '-' => 'nwnnnnwnw',
            '.' => 'wwnnnnwnn',
            ' ' => 'nwwnnnwnn',
            '*' => 'nwnnwnwnn',
            '$' => 'nwnwnwnnn',
            '/' => 'nwnwnnnwn',
            '+' => 'nwnnnwnwn',
            '%' => 'nnnwnwnwn',
        );
        
        $this->SetFont('','B');
        $this->SetFont('Arial','',6);
        $this->Text($xpos, $ypos + $height + 7, strtoupper($code));
        $this->SetFillColor(0);
        
        $code = '*'.strtoupper($code).'*';
        for($i=0; $i<strlen($code); $i++){
            $char = $code{$i};
            if(!isset($barChar[$char])){
                $this->Error('Invalid character in barcode: '.$char);
            }
            $seq = $barChar[$char];
            for($bar=0; $bar<9; $bar++){
                if($seq{$bar} == 'n'){
                    $lineWidth = $narrow;
                }else{
                    $lineWidth = $wide;
                }
                if($bar % 2 == 0){
                    $this->Rect($xpos, $ypos, $lineWidth, $height, 'F');
                }
                $xpos += $lineWidth;
            }
            $xpos += $gap;
        }
    } 
    
    
    
    
}

function pdml_entity_decode( $given_html, $quote_style = ENT_QUOTES )
{
    $trans_table = array_flip(array_merge(
        get_html_translation_table( HTML_SPECIALCHARS, $quote_style ),
        get_html_translation_table( HTML_ENTITIES, $quote_style) ));
    $trans_table['&#39;'] = "'";
    $trans_table['&euro;'] = chr(128);
    $trans_table['&bull;'] = chr(149);
    return ( strtr( $given_html, $trans_table ) );
}


class Document extends Model
{
    protected $guarded = ['id'];
    
    public static function createPdf($model,$id,$relation,$rid,$role,$action)
    {
        //Get document template data
            //$document_template = 'App\\Document'::where("role", '=', $role)->get();
            $document_template = 'App\\Document'::where('role', $role)->first();;
            $units = 'App\\Unit'::all();
            $taxes = 'App\\Tax'::all();
            foreach($taxes as $key => $value){
                $taxes[$key]['sumNetto'] = 0;
                $taxes[$key]['sumTax'] = 0;
            }


        if($action == 'preview_stream'){
            $document = $model;
            $model = "Preview-$role";
        }else{
            //Create model name
            $modelName='App\\' . $model;
            $modelNameRelation='App\\' . $relation;
 
            //Get document
            $document = $modelName::find($id);  
        }

        //Check if the document get a number if not create it
        if($action == 'create'){
            
            if($document['number'] == ''){
                //Get new document number
                //Todo make flexible
                if($model == 'DocumentOffer'){
                    $number = 'App\\NumberObject'::getNumber(4);
                }elseif($model == 'DocumentOrder'){
                    $number = 'App\\NumberObject'::getNumber(3);
                }elseif($model == 'DocumentConfirmation'){
                    $number = 'App\\NumberObject'::getNumber(13);
                }elseif($model == 'DocumentInvoice'){
                    $number = 'App\\NumberObject'::getNumber(1);
                }elseif($model == 'DocumentCreditNote'){
                    $number = 'App\\NumberObject'::getNumber(2);
                }elseif($model == 'DocumentReminder'){
                    $number = 'App\\NumberObject'::getNumber(7);
                }elseif($model == 'DocumentRental'){
                    $number = 'App\\NumberObject'::getNumber(5);
                }elseif($model == 'DocumentHire'){
                    $number = 'App\\NumberObject'::getNumber(12);
                }elseif($model == 'DocumentDeliveryNote'){
                    $number = 'App\\NumberObject'::getNumber(6);
                }elseif($model == 'DocumentMaterialList'){
                    $number = 'App\\NumberObject'::getNumber(14);
                }elseif($model == 'Project'){
                    $number = 'App\\NumberObject'::getNumber(8);
                }
                
                //$document['number'] = $number;

                $document = $modelName::find($id);
                
                $document->number = $number;
                
                $document->save();

            }
        }
        


        //Check if a project is set
        if($document['project_id'] == 0){
            $project['number'] = '';
            $project['type']  = 0;
            $project['name'] = '';
            $project['description'] = '';
            $project['start_date_time'] = '';
            $project['end_date_time'] = '';
        }else{
            //Get project
            $project = 'App\\Project'::find($document['project_id']);
        }

        
        if($action == 'preview_stream'){
            $items = (object)$relation;
            $i =0;
            foreach($items as &$row) {
            $row->id = ++$i;
            
            }
            
            //var_dump($items);
        }else{
        
        //$items = 'App\\DocumentInvoiceItem'::where("ref_id", '=', '19')->get(); //->orderBy('pos', 'asc')
        $items = $modelName::find($id)->items;
        }
        
        $masterdata = 'App\\Masterdata'::find($document['masterdata_id']);
        $person = 'App\\Person'::find($document['person_id']);
        
        //$person = 'App\\Person'::where("masterdata_id", '=', "$masterdata_id", 'AND', "default", '=', 1)->get();
        //$person = 'App\\Person'::where("default", "=", 1)->where("masterdata_id", "=", $masterdata_id)->get();
        
        
        
        //Person
        if($person == ''){
            $first_name = $masterdata['first_name'];
            $last_name = $masterdata['last_name'];
            $gender = 1;
        }else{
            $first_name = $person['first_name'];
            $last_name = $person['last_name'];
            $gender = $person['gender'];
        }
        
        //Salutation        
        if($gender == 2){
            $salutation = 'geehrte Frau';
        }elseif($gender == 3){
            $salutation = 'geehrter Herr';
        }else{
            $salutation = 'geehrte(r) Frau/Herr';
        }
       
        
        $user_first_name = Auth::user()->first_name;
        $user_last_name = Auth::user()->last_name;
        

        //Project type
        $project_type = array(
        '',
        'Vermietung - Selbstabholer',
        'Vermietung - Mit Lieferung',
        'Nur Resourcen',
        'Full-Service',
        'Verkauf'
        );
      
        $pattern = array(
            '/{masterdata_number}/',
            '/{masterdata_company_name_1}/',
            '/{masterdata_company_name_2}/',
            '/{masterdata_salutation}/',
            '/{masterdata_first_name}/',
            '/{masterdata_last_name}/',
            '/{masterdata_street}/',
            '/{masterdata_house_number}/',
            '/{masterdata_zip}/',
            '/{masterdata_city}/',
            '/{masterdata_country}/',
            '/{manager}/',
            '/{manager_phone}/',
            '/{manager_fax}/',
            '/{manager_mobil}/',
            '/{manager_mail}/',
            '/{project_number}/',
            '/{project_type}/',
            '/{project_name}/',
            '/{project_description}/',
            '/{project_start_date_time}/',
            '/{project_end_date_time}/',
            '/{document_number}/',
            '/{document_date}/'
            
        );
        
        $replacement = array(
            $masterdata['number'],
            $masterdata['company_name_1'],
            $masterdata['company_name_2'],
            $salutation,
            $first_name,
            $last_name,
            $masterdata['street'],
            $masterdata['house_number'],
            $masterdata['zip'],
            $masterdata['city'],
            $masterdata['country_id'],
            "$user_first_name $user_last_name",
            Auth::user()->phone,
            Auth::user()->fax,
            Auth::user()->mobile,
            Auth::user()->email_name,
            $project['number'],
            $project_type[$project['type']],
            $project['name'],
            $project['description'],
            substr($project['start_date_time'], 0, -9),
            substr($project['end_date_time'], 0, -9),
            $document['number'],
            substr($document['created_at'], 0, -9)
        );
        
        
        //TODO Country
        
        /*
         * 
        {document_number}
        {document_date}
        
        {manager}
        {manager_phone}
        {manager_fax}
        {manager_mobil}
        {manager_mail}
        
        
        {project_type}
        {project_name} 
        {project_start_date_time} 
        {project_end_date_time}
        */
        
        
        //Replace text on first side
        $document_template['template_pdml_header_first'] = preg_replace(
            $pattern,
            $replacement ,$document_template['template_pdml_header_first']);
        
        $document_template['template_pdml_footer_first'] = preg_replace(
            $pattern,
            $replacement ,$document_template['template_pdml_footer_first']);
        
        //Replace text on following sides
        $document_template['template_pdml_header_following'] = preg_replace(
            $pattern,
            $replacement ,$document_template['template_pdml_header_following']);
        
        $document_template['template_pdml_footer_following'] = preg_replace(
            $pattern,
            $replacement ,$document_template['template_pdml_footer_following']);
        
        
        
        function getUnit($id, $units)
        {
            foreach ($units as $row)
            {
                if ($row['id'] == $id)
                    return $row['short_name'];
            }
        }

        function getTaxName($id, $taxes)
        {
            foreach ($taxes as $row)
            {
                if ($row['id'] == $id)
                    return $row['name'];
            }
        }

        function getTaxShortName($id, $taxes)
        {
            foreach ($taxes as $row)
            {
                if ($row['id'] == $id)
                    return $row['short_name'];
            }
        }
        

        function getTaxPercentage($id, $taxes)
        {
            foreach ($taxes as $row)
            {
                if ($row['id'] == $id)
                    return $row['percent'];
            }
        }

        function addTaxNettoSum($id, $taxes, $sumTax, $sumNetto)
        {
            foreach ($taxes as $key => $row )
            {
                if ($row['id'] == $id){
                    $taxes[$key]['sumNetto'] = $taxes[$key]['sumNetto'] + $sumNetto;
                    $taxes[$key]['sumTax'] = $taxes[$key]['sumTax'] + $sumTax;
                }      
            }
        }
        
        
        //Create pdf
        
        $pdf = new PDF();
        //Set document information
        $author_prefix = $document_template['author'];
        $pdf->SetAuthor("$author_prefix $user_first_name $user_last_name");
        //$pdf->SetAutoPageBreak();
        //$pdf->SetCompression();
        $pdf->SetCreator('bozwo');
        //$pdf->SetDisplayMode();
        $pdf->SetKeywords($document_template['keywords']);
        
        $pdf->SetLeftMargin($document_template['margin_left']);
        $pdf->SetRightMargin($document_template['margin_right']);
        $pdf->SetTopMargin($document_template['margin_top']);
        //$pdf->SetMargins();
        
        $pdf->SetTitle($document_template['title']);
        $pdf->SetSubject($document_template['subject']);

        
        
        //First page
        $pdf->AddPage($document_template['orientation'],$document_template['format'],$document_template['rotate']);
        //Preview
        if($action == 'preview' or $action == 'preview_stream'){
            $pdf->SetFont('Arial', 'B', 80);
            $pdf->SetTextColor(255, 0, 0);
            $pdf->MultiCell(0, 100, 'Vorschau');
            $pdf->SetFont('Arial', 'B', 10);
            $pdf->SetTextColor(0, 0, 0);
        }
        //Set source file
        $pdf->setSourceFile('/www/htdocs/w01554f2/bozwo/document_templates/'.$document_template['template_pdf_first']);
        
        //import page 1
        $tplIdx = $pdf->importPage(1);
        
        
        $pdf->setSourceFile('/www/htdocs/w01554f2/bozwo/document_templates/'.$document_template['template_pdf_following']);
        
        //import page 1
        $tplIdx2 = $pdf->importPage(1);
        
        //Attachment
        
        if($document_template['template_pdf_attachment'] != ''){
        $pdf->setSourceFile('/www/htdocs/w01554f2/bozwo/document_templates/'.$document_template['template_pdf_attachment']);
        
        //import page 1
        $tplIdx3 = $pdf->importPage(1);
        }
        
        
        //use the imported page and place it at position 10,10 with a width of 100 mm
        $pdf->useTemplate($tplIdx, 0, 0, 210);
        $pdf->SetFont('Arial','B',10);
        
        
        $pdf->_parsePDML(iconv("UTF-8", "ISO-8859-1", $document_template['template_pdml_header_first']));
        


        //$pdf->MultiCell(40,10,$document_template['template_pdml_header_first']);
        //$pdf->SetFont('Arial', 'B', 12);
        //$pdf->Cell(0, 170, $document_template['id']);
        //$pdf->Cell(0, 200, $document_template['model']);
        //$pdf->Cell(0, 10, $document_template['subject']);
        
        
        
        $pdf->AliasNbPages();
        //$pdf->AddPage();
        //$pdf->SetFont('Times','',12);
        //for($i=1;$i<=40;$i++)
            //$pdf->Cell(0,10,'Printing line number '.$i,0,1);
        
        
        //Subproject
        $pdf->SetY(121);
        //$pdf->SetFont('Arial', '', 10);
        //$pdf->Cell(0, 10, '{subproject_name}  {subproject_start_date_time} - {subproject_end_date_time}');

        
        //Table with 20 rows and 4 columns
        $pdf->SetFont('Arial', '', 8);
        $pdf->SetWidths(array(12,15,45,21,12,8,21,12,8,18));
        $pdf->SetAligns(array('L','L','L','R','R','L','L','L','L','R'));
        $pdf->SetY(130);
        
        
        
        ///$pdf->SetLineWidth(0.1);
        //$pdf->Line(20, $pdf->GetY(), 190, $pdf->GetY());
        
        
        
       
        
        //Calculation vars
        $row_material_sum = 0;
        $row_resource_sum = 0;
        //var $cat_sum = 0;
        $total_materials_sum = 0;
        $total_resources_sum = 0;
        $total_materials_discount = 0;
        $total_resources_discount = 0;
        $total_taxes_sum = 0;

        $show_materials_sum = false;
        $show_resources_sum = false;

        $subproject_discount_percentage = 0;
        

        //Write and calculate rows
        setlocale(LC_MONETARY, 'de_DE');
        foreach($items as &$row) {
            //$row->type = "Type03";
            $name = iconv("UTF-8", "ISO-8859-1", $row->name);
            
            //Count Items
            if($row->type == 2){
                //Count materials
            	$row_sum= $row->price * $row->quantity * $row->factor;
                $total_materials_sum = $total_materials_sum + $row_sum;

                $row_sum_discounted = $row_sum - (($row_sum/ 100)*$subproject_discount_percentage);
                $row_taxes_sum = (($row_sum_discounted / 100) * getTaxPercentage($row->tax_id,$taxes)); 
                
                addTaxNettoSum($row->tax_id,$taxes,$row_taxes_sum,$row_sum);

                $show_materials_sum = true;
            }elseif($row->type == 3){
            	//Count resources
            	$row_sum= $row->price * $row->quantity * $row->days + ($row->price * $row->quantity * $row->days_off * $row->factor);
                $total_resources_sum = $total_resources_sum + $row_sum;

                $row_sum_discounted = $row_sum - (($row_sum/ 100)*$subproject_discount_percentage);
                $row_taxes_sum = (($row_sum_discounted / 100) * getTaxPercentage($row->tax_id,$taxes)); 


                addTaxNettoSum($row->tax_id,$taxes,$row_taxes_sum,$row_sum);
                $show_resources_sum = true;
            }
           
            
            
            
            //Subproject
            if($row->type == 0){
            	$pdf->SetWidths(array(12,45,45,40,30));
            	$pdf->SetAligns(array('L','L','L','L','R'));
                //Set Subproject dates
                //$subproject_start_date_time = $row->start_date_time;
                //$subproject_end_date_time = $row->end_date_time;
                
                $subproject_start_date_time = substr($row->start_date_time, 0, -9);
                $subproject_end_date_time = substr($row->end_date_time, 0, -9);
                
                //Count Subproject sum
                $subproject_sum = 0;
                $subproject_discount_sum = 0;
                $subproject_materials_discount_sum = 0;
                $subproject_resources_discount_sum = 0;
                $subproject_discount_percentage = $row->discount;
                foreach($items as &$row_cat) {
                    if($row->id == $row_cat->ref_id){
                        //$subproject_sum = ($row_c->price * $row_c->quantity)+$subproject_sum;
                        foreach($items as &$row_item) {
                            if($row_cat->id == $row_item->ref_id){
                            	//$row_pre_sum = $row_item->price * $row_item->quantity;
                            	
                            	if($row_item->type == 2){
                            		//Count materials
                            		$row_pre_sum= $row_item->price * $row_item->quantity * $row_item->factor;
                            		$subproject_materials_discount_sum = (($row_pre_sum/ 100)*$row_item->discount)+$subproject_materials_discount_sum;
                            	}elseif($row_item->type == 3){
                            		//Count resources
                            		$row_pre_sum= $row_item->price * $row_item->quantity * $row_item->days + ($row_item->price * $row_item->quantity * $row_item->days_off * $row_item->factor);
                            		$subproject_resources_discount_sum = (($row_pre_sum/ 100)*$row_item->discount)+$subproject_resources_discount_sum;
                            	}
                            	
                            	
                            	$subproject_sum = $row_pre_sum+$subproject_sum;
                            	$subproject_discount_sum = (($row_pre_sum/ 100)*$row_item->discount)+$subproject_discount_sum;
                            	
                            }
                        }
                    }
                }
                
                
                
                
                //Count total materials discount
                $total_materials_discount = $subproject_materials_discount_sum + $total_materials_discount;
                
                //Count resources
                $total_resources_discount = $subproject_resources_discount_sum + $total_resources_discount;
                
                //Create subproject discount text
                if($row->discount == 0) {
                    $subprojectDiscountText = '';
                }else{
                     $subprojectDiscountText = '(R.'.$row->discount.'% '.money_format('%!n', $subproject_discount_sum).EUR.')';             
                }
               
                //Write
                $pdf->SetWidths(array(12,45,45,40,30));
            	$pdf->SetAligns(array('L','L','L','L','R'));
                $pdf->SetFont('Arial', 'B', 10);
                $pdf->Row(array(
                    $row->pos.'',    
                    $name,
                    substr($row->start_date_time, 0, -9).' - '.substr($row->end_date_time, 0, -9),
                	$subprojectDiscountText,
                    '('.money_format('%!n', $subproject_sum).EUR.')'
                ),$tplIdx2,$document_template['template_pdml_header_following'],$row->type);
                
                //$pdf->SetFont('Arial', 'B', 10);
                //$pdf->Cell(170,15,$row->pos.'    '.$name.'     '.substr($row->start_date_time, 0, -9).'  -  '.substr($row->end_date_time, 0, -9));
                $pdf->SetLineWidth(0.1);
                $pdf->Line(20, $pdf->GetY()-1, 190, $pdf->GetY()-1);
                
                //Table Header
                $pdf->SetWidths(array(12,15,45,21,12,8,21,12,8,18));
                $pdf->SetAligns(array('L','L','L','R','R','L','L','L','L','R'));
                $pdf->SetFont('Arial', 'B', 8);
                $pdf->Row(array(
                    'Pos',
                    'Art.Nr.',
                    'Bezeichnung',
                    'Preis',
                    'Menge',
                    'ME',
                    'Datum',
                    'Tage',
                    'f',
                    'Summe'
                ),$tplIdx2,$document_template['template_pdml_header_following'],9);
                $pdf->SetLineWidth(0.1);
                $pdf->Line(20, $pdf->GetY()-1, 190, $pdf->GetY()-1);
            //Material Category    
            }elseif($row->type == 1){
            	$pdf->SetWidths(array(12,15,45,21,12,8,21,12,8,18));
            	$pdf->SetAligns(array('L','L','L','R','R','L','L','L','L','R'));
                //Count cat sum
                $cat_sum = 0;
                foreach($items as &$row_c) {
                    if($row->id == $row_c->ref_id){


                        if($row_c->type == 2){
                            //Count materials
                            //$row_pre_sum= $row_item->price * $row_item->quantity * $row_item->factor;
                            //$subproject_materials_discount_sum = (($row_pre_sum/ 100)*$row_item->discount)+$subproject_materials_discount_sum;
                            $cat_sum = ($row_c->price * $row_c->quantity * $row_c->factor)+$cat_sum;
                        }elseif($row_c->type == 3){
                            //Count resources
                            //$row_pre_sum= $row_item->price * $row_item->quantity * $row_item->days + ($row_item->days_off * $row_item->factor);
                            //$subproject_resources_discount_sum = (($row_pre_sum/ 100)*$row_item->discount)+$subproject_resources_discount_sum;
                            $cat_sum = ($row_c->price * $row_c->quantity * $row_c->days + ($row_c->price * $row_c->quantity * $row_c->days_off * $row_c->factor))+$cat_sum;
                        }


                        
                        
                    }  
                }
                //Write category row
                $pdf->SetFont('Arial', 'B', 8);
                $pdf->Row(array(
                    $row->pos.'',
                    '',
                    $name,
                    '',
                    '',
                    '',
                    '',
                    '',
                    '',
                    '('.money_format('%!n', $cat_sum).EUR.')' 
                ),$tplIdx2,$document_template['template_pdml_header_following'],9);
                $pdf->SetLineWidth(0.1);
                $pdf->Line(20, $pdf->GetY()-1, 190, $pdf->GetY()-1);
            
            //Write material and resources rows
            }else{
            	$pdf->SetWidths(array(12,15,45,21,12,8,21,12,8,18));
            	$pdf->SetAligns(array('L','L','L','R','R','L','L','L','L','R'));
                //Show dates
                
                $start_date_time = substr($row->start_date_time, 0, -9);
                $end_date_time = substr($row->end_date_time, 0, -9);
                
                //TODO check order
                if(isset($subproject_start_date_time)){

                }else{

                    //$subproject_start_date_time = '1970-01-01';
                }
                
                if($subproject_start_date_time != $start_date_time or $subproject_end_date_time != $end_date_time){
                    if($start_date_time == $end_date_time){
                        $material_dates = $start_date_time;
                    }else{
                        $material_dates = $start_date_time." ".$end_date_time;
                    }
                
                }else{
                    $material_dates = '';
                }

                if($row->type == 3){
                    $days_used_or_off = $row->days_off;
                }else{
                    $days_used_or_off = $row->days_used;
                }
                //rows
                $pdf->SetFont('Arial', '', 8);
                $pdf->Row(array(
                    '  '.$row->pos,
                    sprintf('%06d', $row->inventory_id),
                    $name,
                    money_format('%!n', $row->price).EUR,
                    $row->quantity,
                    getUnit($row->unit_id, $units),
                    $material_dates,
                    $row->days."/".$days_used_or_off,
                    $row->factor,
                    money_format('%!n', $row_sum).EUR
                ),$tplIdx2,$document_template['template_pdml_header_following'],$row->type);
                
            }
            
            
        }
        
        
        //Issue a page break first if needed
        $pdf->CheckPageBreak(55,$tplIdx2,$document_template['template_pdml_header_following']);
        $pdf->SetY($pdf->GetY()+20);
        
        $pdf->SetLineWidth(0.1);
        $pdf->Line(100, $pdf->GetY(), 190, $pdf->GetY());

        //Materials
        if($show_materials_sum){
            $pdf->SetFont('Arial', '', 10);
            $pdf->Cell(0,10,'Summe Material:  '.money_format('%!n', $total_materials_sum).EUR,0,0,'R');
            
            //Calculate discount for materials
            //$pdf->CheckPageBreak(55,$tplIdx2,$document_template['template_pdml_header_following']);
            $total_materials_sum = $total_materials_sum - $total_materials_discount;
            $pdf->SetY($pdf->GetY()+5);
            $pdf->SetFont('Arial', '', 10);
            if($total_materials_discount > 0){
                $pdf->Cell(0,10,'Rabatt auf Material:  -'.money_format('%!n', $total_materials_discount).EUR,0,0,'R');
                $pdf->SetY($pdf->GetY()+5);
            }
        }
     
        //Resources
        if($show_resources_sum){
            $pdf->CheckPageBreak(55,$tplIdx2,$document_template['template_pdml_header_following']);
            $pdf->SetY($pdf->GetY()+10);
            $pdf->SetFont('Arial', '', 10);
            $pdf->Cell(0,10,'Summe Resourcen:  '.money_format('%!n', $total_resources_sum).EUR,0,0,'R');
            
            
            //Calculate discount for resources
            $pdf->CheckPageBreak(55,$tplIdx2,$document_template['template_pdml_header_following']);
            $total_resources_sum = $total_resources_sum - $total_resources_discount;
            $pdf->SetY($pdf->GetY()+5);
            $pdf->SetFont('Arial', '', 10);
            if($total_resources_discount > 0){
                $pdf->Cell(0,10,'Rabatt auf Resourcen:  -'.money_format('%!n', $total_resources_discount).EUR,0,0,'R');
                $pdf->SetY($pdf->GetY()+5);
            }
            
        }
        
        //SubTotal netto
        $pdf->CheckPageBreak(55,$tplIdx2,$document_template['template_pdml_header_following']);
        $total_sum = $total_materials_sum + $total_resources_sum;
        
        $pdf->SetY($pdf->GetY()+10);
        $pdf->Cell(0,10,'Summe Netto:  '.money_format('%!n', $total_sum).EUR,0,0,'R');
        
        //Taxes
        $mws_sum = $total_sum * 1.19;
        $mws_sum = $mws_sum - $total_sum;
        //$pdf->SetY($pdf->GetY()+5);
        //$pdf->Cell(0,10,'+19,00% MwSt.:  '.money_format('%!n', $mws_sum).EUR,0,0,'R');
        //$pdf->SetY($pdf->GetY()+5);
        //$pdf->Cell(0,10,'+19,00% MwSt.:  '.money_format('%!n', $total_taxes_sum).EUR,0,0,'R');


        $total_taxes_sum = 0;
        foreach ($taxes as $row)
            {
                if($row['sumNetto'] != 0){
                    $pdf->SetY($pdf->GetY()+5);
                    $pdf->Cell(0,10,'+'.$row['percent'].'% '.$row['short_name'].
                    ' ('.money_format('%!n',$row['sumNetto']).'):  '.
                    money_format('%!n', $row['sumTax']).EUR,0,0,'R');
                    $total_taxes_sum =  $total_taxes_sum + $row['sumTax'];
                }
            }


        
        //Total brutto
        $pdf->SetY($pdf->GetY()+5);
        $pdf->SetFont('Arial', 'B', 10);
        $pdf->Cell(0,10,'Summe Brutto  '.money_format('%!n', $total_taxes_sum+$total_sum).EUR,0,0,'R');
        

        //Payment terms
        if($document['payment_term_id'] != 0){        
            //Get
            $paymentTerm = 'App\\PaymentTerm'::find($document['payment_term_id']);
            
            //Create date
            $futureDate = date('Y-m-d', strtotime($document['created_at']. ' + ' .$paymentTerm['payment_target_net'] .' days'));

            //Draw Line
            $pdf->SetY($pdf->GetY()+15);
            $pdf->SetLineWidth(0.1);
            $pdf->Line(100, $pdf->GetY(), 190, $pdf->GetY());

            //Write description
            $pdf->SetY($pdf->GetY()+5);
            $pdf->SetFont('Arial', 'B', 10);
            $pdf->Cell(0,10,'Zahlungskonditionen:',0,0,'R');
            

            //Replace placeholder fo date
            $pattern = array(
                '/{future_date}/'
            );
            
            $replacement = array(
                $futureDate
            );
            
        
            
            //Replace text on first side
            $paymentTermText = preg_replace(
                $pattern,
                $replacement ,$paymentTerm['description']);

            $pdf->SetY($pdf->GetY()+5);
            $pdf->SetFont('Arial', '', 10);
            $pdf->Cell(0,10,$paymentTermText,0,0,'R');
            
        }
        

        //Attachment page
        if(isset($tplIdx3)){
        $pdf->AddPage($document_template['orientation'],$document_template['format'],$document_template['rotate']);
        
        
        //use the imported page and place it at position 10,10 with a width of 100 mm
        $pdf->useTemplate($tplIdx3, 0, 0, 210);
        $pdf->_parsePDML(iconv("UTF-8", "ISO-8859-1", $document_template['template_pdml_header_following']));
        }
        $pdf->SetFont('Arial','B',10);
        
        
        $document_number = $document['number'];
        $pathFilename=base_path()."/spool/$model-$document_number.pdf";
        $filename="$model-$document_number.pdf";
        $pdf->Output($pathFilename,'F');
       return $filename;
    }
    
}
