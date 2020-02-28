# React Native Version Admin

Web service where you can upload react native app js bundles for future dynamic bundle updates inside your app. App reviews in App Store and Google Play may take a long time so it might be handy to update bundles immediately. So this service is a light version of [CodePush](https://microsoft.github.io/code-push/).

## Possible workflow
1. Upload your app js bundle to the service (manually or via any CI tool).
2. Inside your app check via API if there are any new bundles available.
3. If new bundle is available then download it inside your app and set the newly downloaded bundle as active.

NOTICE: only JS updates will be applied. So if you add any native code to your app then it wouldn't be possible to dynamically update the bundle.

## Setup
1. Install dependencies
```
npm install
```
2. Create `.env` file in the root folder:
```
ADMIN_EMAIL=admin@gmail.com
API_URL=http://localhost:3000
AWS_ACCESS_KEY_ID=YOUR_AWS_ACCESS_KEY
AWS_SECRET_ACCESS_KEY=YOUR_AWS_SECRET_ACCESS_KEY
AWS_S3_BUCKET=YOUR_AWS_S3_BUCKET
AWS_S3_REGION=YOUR_AWS_S3_REGION
JWT_SECRET=YOUR_JWT_SECRET
OAUTH_GOOGLE_CLIENT_ID=YOUR_OAUTH_GOOGLE_CLIENT_ID
OAUTH_GOOGLE_CLIENT_SECRET=YOUR_OAUTH_GOOGLE_CLIENT_SECRET
ITEMS_PER_PAGE=20
MONGO_DB_CONNECTION=mongodb://localhost:27017/rn_version_admin
PORT=3000
```
Params:
- **ADMIN_EMAIL**: admin email used for initial authentication. On service start admin user is created and this ADMIN_EMAIL param is assigned to this newly created user. Useful for initial authentication via Google OAuth.
- **API_URL**: full API url.
- **AWS_ACCESS_KEY_ID**(optional): AWS access key id. Set it only if you want to upload bundles to AWS S3 service.
- **AWS_SECRET_ACCESS_KEY**(optional): AWS secret access key. Set it only if you want to upload bundles to AWS S3 service.
- **AWS_S3_BUCKET**(optional): AWS S3 bucket name. Set it only if you want to upload bundles to AWS S3 service.
- **AWS_S3_REGION**(optional): AWS S3 region name. Set it only if you want to upload bundles to AWS S3 service.
- **JWT_SECRET**: JWT secret string. Basically should be a long random string.
- **OAUTH_GOOGLE_CLIENT_ID**: OAuth Google client id. Used for admin authentication.
- **OAUTH_GOOGLE_CLIENT_SECRET**: OAuth Google client secret, Used for admin authentication.
- **ITEMS_PER_PAGE**: number of items (users or bundles) per page. Used for server pagination.
- **MONGO_DB_CONNECTION**: Mongo DB connection string.
- **PORT**: server port.

3. Compile frontend:
```
npm run frontend:build
```

4. Start backend:
```
npm run backend:live
```

Now your service should be running(if you used environment variables from this setup) at `http://localhost:3000`. You should be able to login and manage users and bundles.

5. Now you should setup bundle upload. Imagine that you have a CI service that creates app js bundle on every commit. Every user has an API key(check the frontend dashboard). This API key is used for bundle upload and should be added to `Authorization` header. Example: `Authorization: Bearer API_KEY_FROM_DASHBOARD`. You can upload every new bundle with new version via the following API: `/api/v1/bundles`. Just send POST multipart-form-data request with the following body:
- **platform**: bundle platform. Available values: `ios` and `android`.
- **storage**: storage type. Available values: `file` and `aws_s3`. If you set the `file` storage then bundle will be saved locally on the server. If you set `aws_s3` storage then bundle will be saved to AWS S3 storage(don't forget to setup environment variables for AWS).
- **is_update_required**: whether app update is required. Available values: `true` and `false`. By default your app shouldn't dynamically update the bundle. It is better to update bundle only for hot fixing. So if this param is set to `false` then bundle should be downloaded but not set as active. If this param is set to `true` then `is_update_required` field for all other bundles of the same platform will be set to `false` and the newly uploaded bundle should be set as active inside your app.
- **bundle**: JS bundle file.
- **desc**(options): bundle description.

Example response:
```
{
    "_id": "5e599743ee4d7e37ed0d0254",
    "platform": "android",
    "storage": "file",
    "version": "1.0.0",
    "is_update_required": false,
    "url": "http://localhost:3000/static/bundles/1.0.0/android.bundle",
    "desc": "test",
    "created_at": "2020-02-28T22:42:12.005Z",
    "updated_at": "2020-02-28T22:42:12.005Z"
}
```

6. Now inside your app you should setup bundle download and dynamic update. Latest active bundle is available at `/api/v1/bundles/latest/:platform` where `platform` param can be `android` or `ios`.

Example:
```
// GET http://localhost:3000/api/v1/bundles/latest/android
{
    "_id": "5e59978cee4d7e37ed0d0255",
    "desc": "test",
    "platform": "android",
    "storage": "file",
    "version": "1.0.0",
    "is_update_required": false,
    "url": "http://localhost:3000/static/bundles/1.0.0/android.bundle",
    "created_at": "2020-02-28T22:43:24.166Z",
    "updated_at": "2020-02-28T22:43:24.166Z"
}
```

## How to run frontend tests
```
npm run frontend:test
```

## How to run backend integration tests
```
npm run backend:test
```
