/* Яндекс Метрика — один файл для всех страниц сайта «Эльбрус».
   Подключён в <head> каждой страницы строкой: <script src="js/metrika.js" async></script>
   Все изменения счётчика делаются только здесь.
   Код соответствует коду счётчика 113697021 из кабинета Яндекс Метрики.
   Чтобы временно отключить счётчик, поставьте 0 в строке COUNTER_ID.
   Блок <noscript> (учёт посетителей без JavaScript) стоит в HTML каждой страницы сразу после <body>. */
(function () {
  var COUNTER_ID = 113697021; // номер счётчика из кабинета Яндекс Метрики

  if (!COUNTER_ID) return;

  // Загрузочный код Яндекс Метрики (tag.js) — как в кабинете Метрики
  (function (m, e, t, r, i, k, a) {
    m[i] = m[i] || function () { (m[i].a = m[i].a || []).push(arguments); };
    m[i].l = 1 * new Date();
    for (var j = 0; j < document.scripts.length; j++) { if (document.scripts[j].src === r) { return; } }
    k = e.createElement(t), a = e.getElementsByTagName(t)[0], k.async = 1, k.src = r, a.parentNode.insertBefore(k, a);
  })(window, document, 'script', 'https://mc.yandex.ru/metrika/tag.js?id=' + COUNTER_ID, 'ym');

  window.ym(COUNTER_ID, 'init', {
    ssr: true,                    // технический параметр кода вставки (из кабинета Метрики)
    webvisor: true,               // Вебвизор (запись действий посетителей); false — выключить
    clickmap: true,               // карта кликов
    ecommerce: 'dataLayer',       // электронная коммерция (на сайте не используется, оставлено как в кабинете)
    referrer: document.referrer,  // источник перехода
    url: location.href,           // адрес текущей страницы
    accurateTrackBounce: true,    // точный показатель отказов
    trackLinks: true              // переходы по внешним ссылкам
  });
})();
