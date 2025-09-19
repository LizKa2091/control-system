![React](https://img.shields.io/badge/React-19.1.0-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-4.9.5-3178C6?logo=typescript)
![React Query](https://img.shields.io/badge/React_Query-5.75.5-FF4154?logo=react-query)
![Ant Design](https://img.shields.io/badge/AntDesign-5.24.9-0170FE?logo=ant-design)
![Jest](https://img.shields.io/badge/Jest-29.7.0-C21325?logo=jest)
![Testing Library](https://img.shields.io/badge/Testing_Library-16.3.0-E33332?logo=testing-library)

![Node.js](https://img.shields.io/badge/Node.js-20.17.0-43853D?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.19.2-000000?logo=express)
![TypeScript](https://img.shields.io/badge/TypeScript-5.4.0-3178C6?logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-5.15.0-2D3748?logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql)
![JWT](https://img.shields.io/badge/JWT-Authorization-000000?logo=jsonwebtokens)
![bcrypt](https://img.shields.io/badge/bcrypt-5.1.1-yellow)
![Multer](https://img.shields.io/badge/Multer-1.4.5-lightgrey)

# Control System
Система для управления строительными проектами и дефектами

## О проекте
**Control System** — это корпоративное приложение для работы с дефектами на строительных объектах. Система обеспечивает полный цикл: от регистрации дефекта инженером до проверки и закрытия менеджером, а также формирование аналитических отчётов для руководства.

## Бизнес-логика
### Пользователи и роли (разграничение доступа на основе ролей)
- **Инженер**
  - Регистрирует и описывает дефекты
  - Прикрепляет фото/документы
  - Обновляет статус работы по дефекту
  - Ведёт переписку в комментариях
- **Менеджер**
  - Создаёт и управляет проектами
  - Назначает инженеров на дефекты
  - Контролирует сроки и прогресс
  - Проверяет и подтверждает устранение дефектов
  - Генерирует отчёты по проектам
- **Руководитель**
  - Просматривает общую статистику и аналитику
  - Формирует отчёты для заказчиков
  - Анализирует эффективность команды

### Проекты
- Создание новых проектов
- Привязка инженеров и дефектов к проекту
- Отображение прогресса по каждому объекту
- Возможность закрывать проект после завершения работ

### Дефекты
- Создание дефекта с указанием:
  - Заголовка, описания
  - Приоритета (низкий / средний / высокий)
  - Исполнителя
  - Срока устранения
- Прикрепление файлов
- Автоматическая история изменений
- Управление статусами:
  - **Новый** → **В работе** → **На проверке** → **Закрыт**

## Комментарии
- Ведение общения по каждому дефекту
- Возможность добавления нескольких участников
- Уведомления об изменениях в обсуждении

## Аналитика и отчётность
- Количество дефектов по статусам и приоритетам
- Среднее время устранения
- Статистика по исполнителям и проектам
- Визуализация прогресса (графики, диаграммы)
- Экспорт отчётов в CSV/Excel

### Аналитика и отчётность
- Формирование аналитических отчётов с помощью SQL-агрегаций: количество дефектов по статусам, приоритетам, проектам; среднее время устранения.  
- Эндпоинты для экспорта отчётов и выборок дефектов в форматы **CSV** и **Excel** (например, через библиотеку `github.com/xuri/excelize/v2`).  

## Безопасность
- Регистрация и аутентификация через JWT
- Хранение паролей в зашифрованном виде (bcrypt)
- Логирование всех действий пользователей
- Резервное копирование базы данных
- Проверка прав доступа на основе ролей
- Защита от SQL-инъекций, XSS и CSRF

## Технологии
### Frontend
- React + TypeScript
- Vite (сборка)
- SCSS modules (стили)
- React Query (работа с API и кеширование)
- Ant Design (UI-компоненты)
- React Router (навигация)
- Context API (управление состоянием)
- Jest и React Testing Library (тестирование)
### Backend
- Node.js + Express.js
- TypeScript  
- bcrypt (шифрование паролей)  
- jsonwebtoken (аутентификация)  
- multer (загрузка файлов)
- 
### Базы данных
- PostgreSQL  
- Prisma ORM  

### Архитектура
- Монолитное веб-приложение  
- Разграничение ролей (инженер/менеджер/руководитель)  
- Поддержка вложений (фото, документы)  
- Логирование и резервное копирование  

##  Настройка окружения
Перед запуском необходимо создать `.env` файл:
### Для frontend:
```
VITE_API_URL=http://localhost:8000
```
### Для backend:
```
DATABASE_URL=postgresql://user:password@localhost:5432/control_system
JWT_SECRET=ваш_jwt_secret
```

## Запуск и установка проекта
Клонируйте репозиторий: <br />
```
git clone https://github.com/LizKa2091/control-system.git
```
### Frontend
Установите пакеты: <br />
```
cd frontend
```
```
npm install
```
```
npm run dev
```
Клиент будет доступен на http://localhost:5173

### Backend
Установите пакеты: <br />
```
cd backend
```
```
npm install
```
```
npx prisma migrate dev
```
```
npx ts-node server.ts
```
Сервер будет доступен на http://localhost:8000

## 📬 Контакты
Telegram: https://t.me/lizka2091
Email: lizka4231@gmail.com
