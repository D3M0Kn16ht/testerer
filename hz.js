function init() {
    $ui.register((ctx) => {

        const TRANSLATION_CSV = `
key|ru
My library|Моя библиотека
Schedule|Расписание
Manga|Манга
Discover|Обзор
Extensions|Расширения
Settings|Настройки
Manage your plugins and content providers.|Управление плагинами и источниками контента.
Check for updates|Проверить обновления
Add an extension/plugin|Добавить расширение / плагин
Playground|Песочница
Marketplace|Магазин
Built-in|Встроенные
Browse and install extensions from the repository.|Просматривайте и устанавливайте расширения из репозитория.
Source:|Источник:
Official repository|Официальный репозиторий
All types|Все типы
All Languages|Все языки
Refresh|Обновить
Refresh AniList|Обновить AniList
Search extensions...|Поиск расширений...
Apply Default|Применить по умолчанию
Cancel|Отмена
Save|Сохранить
Enter the URL of the repository JSON file.|Введите URL JSON-файла репозитория.
Code|Код
You can edit the code of the extension here.|Здесь можно редактировать код расширения.
Info|Информация
Preferences|Настройки
You can edit the preferences for this extension here.|Здесь можно изменить настройки этого расширения.
Default:|По умолчанию:
Author:|Автор:
Language:|Язык:
Programming language:|Язык программирования:
Uninstall|Удалить
Grant|Разрешить
Permissions required|Требуемые разрешения
Grant permissions|Предоставить разрешения
Storage: Store plugin data locally|Хранилище: сохранять данные плагина локально
AniList: View and edit your AniList lists|AniList: просмотр и редактирование списков
Database: Read and write non-auth data|База данных: чтение и запись неавторизованных данных
AniList Token: View and use your AniList token|Токен AniList: просмотр и использование
The plugin|Плагин
is requesting the following permissions:|запрашивает следующие разрешения:
Remove|Удалить
This action cannot be undone.|Это действие нельзя отменить.
Confirm|Подтвердить
Library|Библиотека
Discover|Обзор
Scan summaries|Результаты сканирования
Search|Поиск
View the media you've saved locally for offline use.|Просмотр контента, сохранённого локально для оффлайн-просмотра.
Sync now|Синхронизировать сейчас
Save media|Сохранить медиа
Local storage size:|Размер локального хранилища:
Update your local snapshots with the data from AniList. This will overwrite your offline changes.|Обновить локальные снимки данными из AniList. Это перезапишет оффлайн-изменения.
Update local data|Обновить локальные данные
Update your AniList lists with the data from your local snapshots.|Обновить списки AniList данными из локальных снимков.
Changes are irreversible.|Изменения необратимы.
Upload local changes to AniList|Загрузить локальные изменения в AniList
Select the media you want to save locally.|Выберите медиа, которое хотите сохранить локально.
Save locally|Сохранить локально
Current|Текущие
Your library is empty|Ваша библиотека пуста
Set the path to your local library and scan it|Укажите путь к локальной библиотеке и отсканируйте её
Include online streaming in your library|Включить онлайн-стриминг в библиотеку
Trending this season|Популярное в этом сезоне
Watch|Смотреть
Releasing|Выходит
days|дней
Add to list|Добавить в список
Todo|К выполнению
Action|Экшен
Adventure|Приключения
Comedy|Комедия
Drama|Драма
Fantasy|Фэнтези
Horror|Ужасы
Music|Музыка
Mystery|Детектив
Psychological|Психология
Romance|Романтика
Sci-Fi|Научная фантастика
Slice of Life|Повседневность
Sports|Спорт
Supernatural|Сверхъестественное
Thriller|Триллер
Release schedule|Расписание выхода
Based on your anime list|На основе вашего списка аниме
Week starts on|Неделя начинается с
Monday|Понедельник
Tuesday|Вторник
Wednesday|Среда
Thursday|Четверг
Friday|Пятница
Saturday|Суббота
Sunday|Воскресенье
Status|Статус
Indicate watched episodes|Отмечать просмотренные серии
Disable image transitions|Отключить анимацию перехода изображений
Coming up next|Далее
Continue reading|Продолжить чтение
Downloads|Загрузки
Score|Оценка
Progress|Прогресс
Start date|Дата начала
Completion date|Дата завершения
Total rereads|Всего перечитываний
Refresh resouces|Обновить ресурсы
Unread chapters only|Только непрочитанные главы
Preview|Предпросмотр
Advanced Search|Расширенный поиск
Aired Recently|Недавно вышедшие
`;

        function parseTranslations(csv) {
            const lines = csv.trim().split(/\r?\n/);
            const data = { ru: {} };

            for (let i = 1; i < lines.length; i++) {
                if (!lines[i].trim()) continue;
                const [key, ru] = lines[i].split('|').map(s => s.trim());
                if (key && ru) {
                    data.ru[key] = ru;
                }
            }
            return data;
        }

        const translations = parseTranslations(TRANSLATION_CSV);

        async function injectRussian() {
            const script = await ctx.dom.createElement("script");
            const scriptContent = `
                (function() {
                    const tr = ${JSON.stringify(translations.ru)};
                    const MAX_LEN = 140;

                    function normalize(t) {
                        return (t || "").toLowerCase()
                            .replace(/\\s+/g, " ")
                            .replace(/\\u00A0/g, " ")
                            .trim();
                    }

                    function translateNode(node) {
                        if (node.nodeType === Node.TEXT_NODE) {
                            const text = node.textContent.trim();
                            if (!text || text.length > MAX_LEN) return;

                            const norm = normalize(text);
                            for (const [en, ru] of Object.entries(tr)) {
                                if (normalize(en) === norm) {
                                    node.textContent = ru;
                                    return;
                                }
                            }
                            return;
                        }

                        if (node.nodeType !== Node.ELEMENT_NODE) return;

                        // атрибуты
                        ["placeholder", "title", "aria-label", "value"].forEach(attr => {
                            let val = node.getAttribute(attr);
                            if (!val) return;
                            val = val.trim();
                            if (val.length > MAX_LEN) return;

                            const norm = normalize(val);
                            for (const [en, ru] of Object.entries(tr)) {
                                if (normalize(en) === norm) {
                                    node.setAttribute(attr, ru);
                                    break;
                                }
                            }
                        });

                        // дети
                        for (let child of node.childNodes) {
                            translateNode(child);
                        }
                    }

                    // первоначальный перевод
                    translateNode(document.body);

                    // наблюдатель за новыми элементами
                    const observer = new MutationObserver(muts => {
                        for (const m of muts) {
                            if (m.type === "childList") {
                                for (const n of m.addedNodes) {
                                    translateNode(n);
                                }
                            } else if (m.type === "characterData") {
                                translateNode(m.target);
                            }
                        }
                    });

                    observer.observe(document.body, {
                        childList: true,
                        subtree: true,
                        characterData: true
                    });

                    // очистка при выгрузке страницы
                    window.addEventListener("beforeunload", () => observer.disconnect());
                })();
            `;

            await script.setAttribute("type", "text/javascript");
            await script.setText(scriptContent);
            (await ctx.dom.queryOne("body")).append(script);
        }

        ctx.dom.onReady(async () => {
            await injectRussian();
        });
    });
}