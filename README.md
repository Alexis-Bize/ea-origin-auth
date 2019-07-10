# EA Origin - Auth

Simple EA Origin authentication module.

### Clone
```
$ git clone https://github.com/Alexis-Bize/ea-origin-auth.git
```

### Build
```
$ npm run build
```

### Usage example

```
EAOriginAuth.authenticate('user@domain.com', '*********')
    .then(console.info)
    .catch(console.error);
```

**Sample response:**
```
{
    "access_token": "X0zqk1AoJ7SkkjqZkASZlwiXE13jIEJtOLL5yZJy9MMgxT6NEZYUzKDbW1xL65BAdw5vY2H5xPgKzTOn88I",
    "token_type": "Bearer",
    "expires_in ": "3600"
}
```

### Parameters

-   email {string}
-   password {string}
