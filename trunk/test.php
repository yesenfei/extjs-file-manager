<?php

$directory = 'locale';
$domain = 'messages';
$locale ="ru_RU";
/*putenv('LC_ALL='.$locale);
setlocale(LC_ALL, $locale);
bindtextdomain($domain, $directory);
textdomain($domain);
bind_textdomain_codeset($domain, 'UTF-8');*/

// ������ ������� ���� �������
putenv("LANG=".$locale);
// ������ ������� ������ (���������)
setlocale (LC_ALL,$locale);

// ������ ������� ������, ��� ���������� ��������
bindtextdomain ($domain, $directory);

// �������� ����� ��� ������

textdomain ($domain);
bind_textdomain_codeset($domain, 'UTF-8');
echo gettext("Test");