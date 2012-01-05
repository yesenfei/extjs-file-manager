<?php
class ResponseImage
{
	protected $img;
	public function __construct(ImageModel $img)
	{
		$this->img = $img;
	}
	public function send()
	{
		header('Content-type: '.$this->img->mime);
		echo file_get_contents($this->img->getPath());
	}
}