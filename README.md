<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./media/brand/itr-runner-logo-white.svg">
    <img alt="IT_RUNNER" src="./media/brand/itr-runner-logo-navy.svg" width="360">
  </picture>
</p>

<h3 align="center">itr-xray — панель управления Xray от IT_RUNNER</h3>

**itr-xray** — это веб-панель для управления серверами [Xray-core](https://github.com/XTLS/Xray-core) в фирменном стиле IT_RUNNER. 

---

## Содержание

- [Установка на сервер](#установка-на-сервер)
- [Локальный просмотр через Docker](#локальный-просмотр-через-docker)
- [Управление](#управление)
- [Что заменено относительно 3x-ui](#что-заменено-относительно-3x-ui)
- [Что намеренно не переименовано](#что-намеренно-не-переименовано)
- [Переход с установленного 3x-ui](#переход-с-установленного-3x-ui)
- [Релизы и версии](#релизы-и-версии)
- [Фирменный стиль](#фирменный-стиль)
- [Обновление из 3x-ui](#обновление-из-3x-ui)
- [Лицензия](#лицензия)

---

## Установка на сервер

```bash
bash <(curl -Ls https://raw.githubusercontent.com/lastresorter/itr-xray/main/install.sh)
```

Установка конкретной версии:

```bash
bash <(curl -Ls https://raw.githubusercontent.com/lastresorter/itr-xray/v1.0.2/install.sh) v1.0.2
```

> [!IMPORTANT]
> Пока репозиторий приватный, эти команды не работают: GitHub не отдаёт скрипт и архивы релиза без авторизации. Установщик заработает, как только репозиторий станет публичным. Ничего менять в коде при этом не нужно.

Поддерживаемые архитектуры: `amd64`, `arm64`, `armv7`, `armv6`, `armv5`, `386`, `s390x`. Дистрибутивы — те же, что у 3x-ui (Debian/Ubuntu, RHEL-семейство, Arch, Alpine и др.).

## Локальный просмотр через Docker

Нужен запущенный Docker Desktop. Из корня репозитория:

```bash
docker compose up -d --build
```

Первая сборка занимает несколько минут: собираются фронтенд и Go-бинарник, скачивается Xray. После сборки откройте <http://localhost:2053>. Логин и пароль — `admin` / `admin`, в настройках панели их нужно сменить.

Остановить и удалить контейнер:

```bash
docker compose down
```

Данные контейнера лежат в папках `db/`, `cert/` и `acme/` рядом с `docker-compose.yml`. Если удалить `db/`, панель запустится с чистой базой.

## Управление

После установки на сервере доступна команда `itr-xray`. Без аргументов она открывает меню, также есть подкоманды:

```
itr-xray              меню управления
itr-xray start        запустить панель
itr-xray stop         остановить
itr-xray restart      перезапустить
itr-xray status       статус
itr-xray settings     текущие настройки (порт, путь, логин)
itr-xray log          журнал
itr-xray update       обновить до последнего релиза
itr-xray uninstall    удалить
```

Служба systemd называется `itr-xray` (`systemctl status itr-xray`, `journalctl -u itr-xray`).

---

## Что заменено относительно 3x-ui

### Интерфейс

| Было (3x-ui) | Стало (itr-xray) |
|---|---|
| Текст «3X-UI» в боковом меню и на экране входа | Векторные логотипы (SVG, буквы в контурах): в развёрнутом боковом меню — `IT-RUNNER`, в свёрнутом — `ITR`, на экране входа и в «О программе» — `IT_RUNNER` |
| Иконки `icons/3x-ui-*.png` | `icons/itr-xray-*.png` (16–512 px) и векторная `icons/itr-xray.svg` со знаком `ITR` |
| Иконки вкладки (favicon) не было | SVG-иконка + PNG-запасной вариант + `apple-touch-icon` на всех страницах, включая страницу подписки |
| Манифест PWA «3x-ui», цвет `#1677ff` | «IT_RUNNER · itr-xray», фирменные цвета |
| Синяя тема Ant Design, по умолчанию тёмная | Фирменная палитра IT_RUNNER: тёмная, светлая и «ультратёмная» темы (см. [Фирменный стиль](#фирменный-стиль)); **по умолчанию — ультратёмная** |
| Экран входа в сине-розовой гамме | Градиент как на титульном слайде IT_RUNNER, фирменные цвета |
| Системный шрифт | Inter для текста, YFF Rare для заголовков |
| Кнопки «Донат» (donate.sanaei.dev) и «Документация» (docs.sanaei.dev), значок версии со ссылкой на GitHub 3x-ui | Кнопка и окно **«О программе»**: версия панели и строка «itr-xray использует open-source решение 3x-ui» со ссылкой на github.com/MHSanaei/3x-ui |
| Заголовок вкладки «3X-UI» | «IT_RUNNER» |
| Издатель (issuer) в QR-коде двухфакторной авторизации «3x-ui» | «IT_RUNNER» |
| Строки с «3X-UI» во всех 12 языках (Telegram-бот, Discord, диалог обновления и др.) | «itr-xray» |
| Имя скачиваемого журнала `x-ui.log` | `itr-xray.log` |
| 13 языков интерфейса | 12: украинский удалён |
| Ссылка на документацию шаблонов подписки в репозитории 3x-ui | Та же страница в `lastresorter/itr-xray` |

### Сервер и система

| Было (3x-ui) | Стало (itr-xray) |
|---|---|
| Команда управления `/usr/bin/x-ui` | `/usr/bin/itr-xray` |
| Скрипт управления `x-ui.sh` | `itr-xray.sh` |
| Служба systemd `x-ui.service` (`x-ui.service.debian/.arch/.rhel`) | `itr-xray.service` (`itr-xray.service.debian/.arch/.rhel`) |
| Служба OpenRC `/etc/init.d/x-ui` (`x-ui.rc`) | `/etc/init.d/itr-xray` (`itr-xray.rc`) |
| Папка программы `/usr/local/x-ui/`, бинарник `x-ui` | `/usr/local/itr-xray/`, бинарник `itr-xray` |
| Папка данных `/etc/x-ui/` | `/etc/itr-xray/` |
| База данных `x-ui.db` | `itr-xray.db` |
| Логи `/var/log/x-ui/` | `/var/log/itr-xray/` |
| Файл окружения `/etc/default/x-ui` (`/etc/conf.d/x-ui`, `/etc/sysconfig/x-ui`) | `/etc/default/itr-xray` (`/etc/conf.d/itr-xray`, `/etc/sysconfig/itr-xray`) |
| Ключ шифрования токенов узлов `/etc/x-ui/node_token_key.json` | `/etc/itr-xray/node_token_key.json` |
| Настройка BBR `/etc/sysctl.d/99-bbr-x-ui.conf` | `/etc/sysctl.d/99-bbr-itr-xray.conf` |
| Cookie сессии `3x-ui` | `itr-xray` |
| Имена резервных копий и временных файлов `x-ui.db`, `x-ui.dump`, `.x-ui-backup-*`, `x-ui-migration-*` | `itr-xray.db`, `itr-xray.dump`, `.itr-xray-backup-*`, `itr-xray-migration-*` |
| Журнал в панели читается из `journalctl -u x-ui` | `journalctl -u itr-xray` |
| Самообновление панели из `MHSanaei/3x-ui` (GitHub API релизов и `update.sh`) | Из `lastresorter/itr-xray` |
| Временная служба обновления `x-ui-web-update-*` | `itr-xray-web-update-*` |
| Тестовое письмо «[3x-ui] Test email», тестовое сообщение Telegram «Test message from 3x-ui» | «[IT_RUNNER] Test email», «Test message from IT_RUNNER itr-xray» |
| Подпись и имя устройства в Discord «3x-ui» | «IT_RUNNER» / «itr-xray» |
| Имена сертификатов mTLS между узлами «3x-ui node mTLS CA», «3x-ui master» | «itr-xray node mTLS CA», «itr-xray master» |
| User-Agent `3x-ui-outbound-sub/1.0`, `3x-ui-remote-routing/1.0`, `3x-ui-pia/1.0`, модель устройства WARP `x-ui` | `itr-xray-outbound-sub/1.0`, `itr-xray-remote-routing/1.0`, `itr-xray-pia/1.0`, `itr-xray` |
| Метка сервиса в разборе журнала `X-UI:` | `ITR:` |
| Джейл, фильтр и действие fail2ban для ограничения по IP `3x-ipl` (`/etc/fail2ban/{jail,filter,action}.d/3x-ipl.conf`, `3x-ipl-backend.conf`) | `itr-xray-ipl` (`itr-xray-ipl.conf`, `itr-xray-ipl-backend.conf`) |
| Журналы ограничения по IP `3xipl.log`, `3xipl-banned.log`, `3xipl-banned.prev.log` | `itr-xray-ipl.log`, `itr-xray-ipl-banned.log`, `itr-xray-ipl-banned.prev.log` |
| Версия панели `3.8.5` | `1.0.2` — собственная нумерация itr-xray |

### Пакет, установщик и сборка

| Было (3x-ui) | Стало (itr-xray) |
|---|---|
| Архив релиза `x-ui-linux-<arch>.tar.gz` (+ `.sha256`), внутри папка `x-ui/` | `itr-xray-linux-<arch>.tar.gz` (+ `.sha256`), внутри папка `itr-xray/` |
| Архив для Windows `x-ui-windows-amd64.zip` | `itr-xray-windows-amd64.zip` |
| `install.sh` / `update.sh` качают из `MHSanaei/3x-ui` | Качают из `lastresorter/itr-xray` |
| Сборка релиза на каждый push в любую ветку | Только по тегу `v*.*.*` или ручному запуску (экономия минут GitHub Actions в приватном репозитории) |
| Релизы по тегу публикуются как pre-release | Как обычные релизы: иначе `install.sh` не находит их через `releases/latest` |
| Канал разработки `dev-latest` обновляется на каждый push в `main` | Обновляется при ручном запуске сборки на `main` |
| Docker-образы `hsanaeii/3x-ui` (Docker Hub) и `ghcr.io/mhsanaei/3x-ui` | Только `ghcr.io/lastresorter/itr-xray`, сборка вручную |
| Контейнер `3xui_app`, часовой пояс `Asia/Tehran` | Контейнер `itr-xray`, часовой пояс `Europe/Moscow` |
| Smoke-тест установщика на каждый push | Только ручной запуск, пока репозиторий приватный |
| Dependabot: отдельный PR на каждую зависимость, раз в неделю | Один сгруппированный PR на экосистему (Go, npm, GitHub Actions) раз в месяц; обновления безопасности приходят сразу |
| Сценарии Actions: ИИ-ревью PR, разбор задач, CodeQL, мутационные тесты, деплой сайта документации | Удалены: без ключей и платных функций GitHub они не работают или относятся только к 3x-ui |
| Путь Go-модуля `github.com/mhsanaei/3x-ui/v3` | `github.com/lastresorter/itr-xray` (все импорты, `go.mod`, флаги сборки в `release.yml`, настройки линтера) |
| README на 7 языках | Этот README; оригинал — в `README.3x-ui.md` |

## Что намеренно не переименовано

| Что | Почему |
|---|---|
| Переменные окружения `XUI_*` (`XUI_PORT`, `XUI_DB_TYPE`, `XUI_DB_DSN`, `XUI_LOG_LEVEL` и др.) и `window.X_UI_*` во фронтенде | Это интерфейс настройки: на них завязаны скрипты, Docker, файлы окружения и документация 3x-ui. Смена имён сломала бы совместимость настроек, а пользователю они не видны. |
| Внутренние переменные в shell-скриптах (`xui_folder`, `xui_service` и т. п.) | Видны только в коде скриптов. |
| Сторонние компоненты: `mtg-multi` (github.com/mhsanaei/mtg-multi), Xray-core, tuic-server | Это отдельные проекты, их бинарники скачиваются из их собственных релизов. |
| Команда `migrate` («migrate from other/old x-ui») | Описывает перенос именно из x-ui. |
| Файл `LICENSE`, история коммитов, упоминания 3x-ui в комментариях кода | Требование GPL-3.0 и честная атрибуция. |
| Папка `docs/` (сайт документации 3x-ui на Next.js) | Не входит в пакет и не собирается, оставлена как справочник. |
| Скриншоты в `media/` | Используются только в `README.3x-ui.md`. |

## Переход с установленного 3x-ui

itr-xray ставится **рядом** с 3x-ui и не трогает её файлы: у них разные пути, службы и базы. Оба по умолчанию занимают порт 2053. Чтобы перенести данные:

```bash
systemctl stop x-ui && systemctl disable x-ui
```

```bash
bash <(curl -Ls https://raw.githubusercontent.com/lastresorter/itr-xray/main/install.sh)
```

```bash
systemctl stop itr-xray && cp /etc/x-ui/x-ui.db /etc/itr-xray/itr-xray.db && systemctl start itr-xray
```

Если вы меняли параметры в `/etc/default/x-ui`, перенесите их в `/etc/default/itr-xray`. После проверки старую 3x-ui можно удалить командой `x-ui uninstall`.

## Релизы и версии

- У itr-xray собственная нумерация версий, не связанная с 3x-ui: сейчас `1.0.2` (файл `internal/config/version`). Проверка обновлений в панели сравнивает версии строго в формате `X.Y.Z`, поэтому суффиксы вроде `-beta` не использовать.
- Установщик не ставит версии ниже `1.0.1` (порог `min_version` в `install.sh`).
- Выпуск релиза: создать и отправить тег, например `git tag v1.0.1 && git push origin v1.0.1`. Сценарий `.github/workflows/release.yml` соберёт архивы для всех архитектур и Windows и прикрепит их к релизу вместе с контрольными суммами.
- Канал разработки (`dev-latest`) обновляется ручным запуском «Release itr-xray» на ветке `main` (вкладка Actions → Run workflow).
- Docker-образ собирается вручную: сценарий «Release itr-xray for Docker».

## Фирменный стиль

Палитра снята с презентации IT_RUNNER (титульный слайд и слайды со светлым фоном):

| Роль | Цвет |
|---|---|
| Тёмно-синий (плашки, логотип на светлом) | `#292852` |
| Градиент фона (титульный слайд, экран входа) | `#2A2953` → `#5956B1` |
| Основной фиолетовый (кнопки в светлой теме) | `#5956B1` |
| Основной цвет в тёмной теме (кнопки, контраст с белым 4,8:1) | `#6966C9` |
| Ссылки в тёмной теме (контраст с фоном 4,9:1) | `#8F8CEB` |
| Акцент, пурпур (отблески, полоска активного пункта меню) | `#B455AD` |
| Светлый сиреневый (второстепенный текст на тёмном) | `#CED0E2` |
| Фон тёмной темы / карточки / всплывающие окна | `#1C1B3A` / `#262550` / `#302E60` |
| Фон светлой темы | `#EEEEF6` |

Шрифты:

- **YFF Rare Mega** (Bold, Black) — заголовки, названия карточек и окон. Подключены подмножества латиницы и кириллицы в woff2 (≈20 КБ на начертание): `frontend/src/assets/fonts/`.
  > Сейчас используется **пробная (TRIAL) версия** шрифта. Лицензия: <http://www.yourfontfetish.com/eula>. Для коммерческого использования шрифт нужно купить и заменить эти два файла.
- **Inter** (OFL, пакет `@fontsource-variable/inter`) — основной текст, таблицы, формы.

Где что лежит:

| Файл | Что |
|---|---|
| `frontend/src/components/brand/ItrLogo.tsx` | Логотипы `IT_RUNNER`, `IT-RUNNER` и `ITR` как SVG-компонент (цвет — `currentColor`) |
| `frontend/src/components/brand/AboutModal.tsx` | Окно «О программе» |
| `frontend/src/hooks/useTheme.tsx` | Цвета тем Ant Design |
| `frontend/src/styles/brand.css` | Шрифты и CSS-переменные `--itr-*` |
| `frontend/src/pages/login/LoginPage.css` | Экран входа |
| `frontend/public/icons/` | Иконки приложения и вкладки |
| `media/brand/` | Логотип (белый и тёмно-синий) и иконка в SVG — для документов и сайта |

Логотип построен из контуров букв YFF Rare Mega Black, поэтому сам шрифт для него не нужен и он не пикселизируется ни в каком размере.

## Обновление из 3x-ui

Репозиторий — полноценный форк с историей 3x-ui. Оригинал подключён как `upstream`. Его теги хранятся с префиксом `upstream/`, чтобы не пересекаться с тегами релизов itr-xray:

```bash
git remote add upstream https://github.com/MHSanaei/3x-ui.git && git config remote.upstream.tagOpt --no-tags
```

```bash
git fetch upstream refs/tags/v3.9.0:refs/tags/upstream/v3.9.0 && git merge upstream/v3.9.0
```

Путь модуля у itr-xray свой, поэтому новые и изменённые Go-файлы из 3x-ui будут импортировать `github.com/mhsanaei/3x-ui/v3/...`. После слияния замените его:

```bash
grep -rlI "github.com/mhsanaei/3x-ui/v3" --include='*.go' . | xargs perl -pi -e 's#github.com/mhsanaei/3x-ui/v3#github.com/lastresorter/itr-xray#g'
```

То же касается имён fail2ban (`3x-ipl`, `3xipl`) в `itr-xray.sh`, `DockerEntrypoint.sh` и `internal/xray/process.go`.

Конфликты обычно бывают в файлах из таблиц выше: `install.sh`, `update.sh`, `itr-xray.sh`, `.github/workflows/release.yml`, `internal/config/config.go`, `frontend/src/hooks/useTheme.tsx`, `frontend/src/layouts/AppSidebar.tsx` и в файлах переводов. В `internal/config/version` при конфликте оставьте версию itr-xray и поднимите её (например, до `1.1.0`). Проверьте также, что новые упоминания `x-ui` / `3x-ui` в скриптах тоже переименованы:

```bash
grep -rn "x-ui" install.sh update.sh itr-xray.sh
```

Проверки перед релизом (в `frontend/` нужен Node 24 из `.nvmrc`, Go — версия из `go.mod`):

```bash
cd frontend && npm ci && npm run gen && npm run typecheck && npm run lint && npm test && npm run build
```

```bash
go vet ./... && go test ./...
```

## Лицензия

itr-xray распространяется по лицензии [GNU GPL v3.0](LICENSE), как и исходный проект [3x-ui](https://github.com/MHSanaei/3x-ui) (© MHSanaei и участники). Изменения IT_RUNNER — оформление интерфейса и переименование — распространяются на тех же условиях.
