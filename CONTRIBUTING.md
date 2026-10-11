# Flujo de Git

Este repositorio usa `main` / `develop` / `feat` / `fix` y pull requests. No se commitea directo a `main` ni a `develop`.

## Ramas permanentes

- `main`: producción (lo desplegado).
- `develop`: integración. Todo mergea acá primero.

Las ramas `en_desarrollo` y `version_extendida` son históricas. No se usan para trabajo nuevo.

## Ramas de trabajo

Siempre desde `develop` actualizado:

```bash
git checkout develop
git pull origin develop
git checkout -b feat/nombre-corto
# o
git checkout -b fix/nombre-corto
```

## Pull requests

1. `feat/*` o `fix/*` → `develop` (integración).
2. Cuando la fase está lista y testeada: `develop` → `main` (release).

Cada PR debe poder desplegar un preview en Vercel.

## Convenciones

- `feat/`: funcionalidad nueva.
- `fix/`: corrección de bugs.
- Un tema por rama. PRs chicos y revisables.
