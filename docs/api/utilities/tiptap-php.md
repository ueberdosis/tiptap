# Tiptap for PHP
[![Latest Version on Packagist](https://img.shields.io/packagist/v/ueberdosis/tiptap-php.svg)](https://packagist.org/packages/ueberdosis/tiptap-php)
[![Total Downloads](https://img.shields.io/packagist/dt/ueberdosis/tiptap-php.svg)](https://packagist.org/packages/ueberdosis/tiptap-php)

## Introduction
A PHP package to work with [Tiptap](https://tiptap.dev/) content. You can transform Tiptap-compatible JSON to HTML, and the other way around, sanitize your content, or just modify it.

## Installation
You can install the package via composer:

```bash
composer require ueberdosis/tiptap-php
```

## Usage
The PHP package mimics large parts of the JavaScript package. If you know your way around Tiptap, the PHP syntax will feel familiar to you. Here is an easy example:

```php
(new Tiptap\Editor)
    ->setContent('<p>Example Text</p>')
    ->getDocument();

// Returns:
// ['type' => 'doc', 'content' => …]
```

## Documentation
There’s a lot more the PHP package can do. Check out the [repository on GitHub](https://github.com/ueberdosis/tiptap-php).

