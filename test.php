<?php

$directory = 'locale';
$domain = 'messages';
$locale ="ru_RU";
/*putenv('LC_ALL='.$locale);
setlocale(LC_ALL, $locale);
bindtextdomain($domain, $directory);
textdomain($domain);
bind_textdomain_codeset($domain, 'UTF-8');*/

// Задаем текущий язык проекта
putenv("LANG=".$locale);
// Задаем текущую локаль (кодировку)
setlocale (LC_ALL,$locale);

// Задаем каталог домена, где содержатся переводы
bindtextdomain ($domain, $directory);

// Выбираем домен для работы

textdomain ($domain);
bind_textdomain_codeset($domain, 'UTF-8');
echo gettext("Test");