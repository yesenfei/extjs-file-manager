<?php
/**
 * @class Response
 */
class Response {
	public $success, $data, $message;

	public function __construct($data, $success = true, $message = '', $resultdata = true, $code = true) {
		$this->success  = $success;
		$this->message  = $message;
		$this->data     = Lib::code($data);
		if($resultdata) {
			$this->data = array(
				'success'   => $this->success,
				'message'   => $this->message,
				'data'      => $this->data
			);
		}
	}
	public function send()
	{
		echo json_encode($this->data);
	}
}
