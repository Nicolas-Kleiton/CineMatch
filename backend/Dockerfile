FROM php:8.3-cli-alpine

RUN apk add --no-cache \
    zip \
    unzip \
    curl \
    git \
    libpng-dev \
    oniguruma-dev \
    libxml2-dev

RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /app

COPY . .

RUN composer install --no-interaction --prefer-dist --optimize-autoloader

RUN chmod -R 775 storage bootstrap/cache

# Permite atender várias requisições em paralelo (o padrão do artisan serve é uma por vez)
ENV PHP_CLI_SERVER_WORKERS=4

# Cacheia a configuração com as variáveis de ambiente do Render antes de subir o servidor
CMD php artisan migrate --force && php artisan config:cache && php artisan serve --host=0.0.0.0 --port=${PORT:-10000}
