<?php
/**
 * Ответ об ошибке
 *
 * @author Сергей
 */
class ResponseError extends Response{
	//put your code here
	public function __construct($message, $data = false) 
	{
		parent::__construct($data, false, $message, true, false);
	}
}

?>
