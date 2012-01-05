<?php
class Lib {
	// Получить ссылку на файл в системе
	static function gpath($path = ''){
		 return Cfg::get('baseDir').'/'.trim($path,' /\\');
	}
	// Конвертирует обьект оиз одной кодировки в другую
	static function convert($var,$charsetFrom,$charsetTo){
		if(is_array($var)){
			foreach($var as $n=>$v){
				$var[$n] = self::convert($v, $charsetFrom,$charsetTo);
			}
		} elseif (is_object($var)) {
			$vars = get_object_vars($var);
			foreach ($vars as $m => $v) {
				$var->$m = self::convert($v, $charsetFrom,$charsetTo);
			}
		} elseif (is_string($var)) {
			$var = iconv($charsetFrom, $charsetTo, $var);
		}
		return $var;
	}
	// Кодировать объект
	static function code($var)
	{
		$charsetFrom = Cfg::get('charset','cp1251');
		$charsetTo = Cfg::get('charsetWeb','UTF-8');
		if($charsetFrom && $charsetTo && $charsetFrom != $charsetTo)
		{
			$var = self::convert($var,$charsetFrom,$charsetTo);
		}
		return $var;
	}
	// Декодировать объект
	static function decode($var,$charset = 'UTF-8')
	{
		$charsetFrom = Cfg::get('charsetWeb','UTF-8');
		$charsetTo =  Cfg::get('charset','cp1251');
		if($charsetFrom && $charsetTo && $charsetFrom != $charsetTo)
		{
			$var = self::convert($var,$charsetFrom,$charsetTo);
		}
		return $var;
	}
	// Человеческий вид доступа файла
	static function hperms($path)
	{
		clearstatcache();
		$path = self::gpath($path);
		$ts=array(
			0140000=>'ssocket',
			0120000=>'llink',
			0100000=>'-file',
			0060000=>'bblock',
			0040000=>'ddir',
			0020000=>'cchar',
			0010000=>'pfifo'
		);
		
		$p=@fileperms($path);
		$t=decoct($p & 0170000); // File Encoding Bit
		
		$str =(array_key_exists(octdec($t),$ts))?$ts[octdec($t)]{0}:'u';
		$str.=(($p&0x0100)?'r':'-').(($p&0x0080)?'w':'-');
		$str.=(($p&0x0040)?(($p&0x0800)?'s':'x'):(($p&0x0800)?'S':'-'));
		$str.=(($p&0x0020)?'r':'-').(($p&0x0010)?'w':'-');
		$str.=(($p&0x0008)?(($p&0x0400)?'s':'x'):(($p&0x0400)?'S':'-'));
		$str.=(($p&0x0004)?'r':'-').(($p&0x0002)?'w':'-');
		$str.=(($p&0x0001)?(($p&0x0200)?'t':'x'):(($p&0x0200)?'T':'-'));
		clearstatcache();
		return $str;
	}
	static function stat($path) {
		clearstatcache();
		$file = self::gpath($path);
		$ss=@stat($file);
		if(!$ss) return false; //Couldnt stat file
	 
		$ts=array(
			0140000=>'ssocket',
			0120000=>'llink',
			0100000=>'-file',
			0060000=>'bblock',
			0040000=>'ddir',
			0020000=>'cchar',
			0010000=>'pfifo'
		);
		
		$p=$ss['mode'];
		$t=decoct($ss['mode'] & 0170000); // File Encoding Bit
		
		$str =(array_key_exists(octdec($t),$ts))?$ts[octdec($t)]{0}:'u';
		$str.=(($p&0x0100)?'r':'-').(($p&0x0080)?'w':'-');
		$str.=(($p&0x0040)?(($p&0x0800)?'s':'x'):(($p&0x0800)?'S':'-'));
		$str.=(($p&0x0020)?'r':'-').(($p&0x0010)?'w':'-');
		$str.=(($p&0x0008)?(($p&0x0400)?'s':'x'):(($p&0x0400)?'S':'-'));
		$str.=(($p&0x0004)?'r':'-').(($p&0x0002)?'w':'-');
		$str.=(($p&0x0001)?(($p&0x0200)?'t':'x'):(($p&0x0200)?'T':'-'));
		 
		 $s=array(
			'perms'=>array(
			'umask'=>sprintf("%04o",@umask()),
			'human'=>$str,
			'octal1'=>sprintf("%o", ($ss['mode'] & 000777)),
			'octal2'=>sprintf("0%o", 0777 & $p),
			'decimal'=>sprintf("%04o", $p),
			'fileperms'=>@fileperms($file),
			'mode1'=>$p,
			'mode2'=>$ss['mode']),
			'is_readable'=> @is_readable($file),
			'is_writable'=> @is_writable($file)
		);
		 
		clearstatcache();
		return $s;
	}
	// Доступно ли редактирование
	static function isWrite($path)
	{
		print_r(Lib::hperms($path));
		 return true;
	}
	// Доступно ли чтение
	static function isRead($path)
	{
		$path = self::gpath($path);
	}
}