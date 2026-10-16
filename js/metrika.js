/* Яндекс Метрика — один файл для всех страниц сайта «Эльбрус».
   Подключён в <head> каждой страницы строкой: <script src="js/metrika.js" async></script>
   Все изменения счётчика делаются только здесь.

   Чтобы включить счётчик: впишите его номер из кабинета Яндекс Метрики вместо 0
   в строке COUNTER_ID ниже. Пока стоит 0, счётчик не загружается и ничего не отправляет. */
(function () {
  var COUNTER_ID = 0; // ← номер счётчика, например 12345678

  if (!COUNTER_ID) return;

  // Стандартный загрузочный код Яндекс Метрики (tag.js)
  (function (m, e, t, r, i, k, a) {
    m[i] = m[i] || function () { (m[i].a = m[i].a || []).push(arguments); };
    m[i].l = 1 * new Date();
    for (var j = 0; j < document.scripts.length; j++) { if (document.scripts[j].src === r) { return; } }
    k = e.createElement(t), a = e.getElementsByTagName(t)[0], k.async = 1, k.src = r, a.parentNode.insertBefore(k, a);
  })(window, document, 'script', 'https://mc.yandex.ru/metrika/tag.js', 'ym');

  window.ym(COUNTER_ID, 'init', {
    clickmap: true,            // карта кликов
    trackLinks: true,          // переходы по внешним ссылкам
    accurateTrackBounce: true, // точный показатель отказов
    webvisor: true             // Вебвизор (запись действий посетителей); false — выключить
  });
})();
