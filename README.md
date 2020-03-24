# React Native Version Admin

Web service where you can upload react native app js bundles for future dynamic bundle updates inside your app. App reviews in App Store and Google Play may take a long time so it might be handy to update bundles immediately. So this service is a light version of [CodePush](https://microsoft.github.io/code-push/).

## Possible workflow
1. Upload your app js bundle to the service (manually or via any CI tool).
2. Add [@cryptoticket/react-native-hot-patching](https://github.com/cryptoticket/react-native-hot-patching) to your react native app. This package will: 
	- check via `rn-version-admin` API if there are any new bundles available
	- download bundle in background
	- set bundle as active in background so that on the next app start downloaded bundle will be applied

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

6. Add [@cryptoticket/react-native-hot-patching](https://github.com/cryptoticket/react-native-hot-patching) to your react native app. This package works with `rn-version-admin` service out-of-the-box.

## Auth via 3rd party sevice

NOTICE: this is a very special case, most of the time you should use standard Google OAuth.

By default users are authorized via Google OAuth. In some cases you should allow 3rd party service to do the auth for you (we are going to call such service a gate service). So gate service manages auth and user permissions. 

If you have a deployed gate service then auth flow is the following:
1. When user clicks "Login with google" in `rn-version-admin` login page he is redirected to gate service.
2. Gate service redirects user to Google OAuth page.
3. User clicks "Allow" in Google auth page and is redirected back to gate service.
4. Gatekeeper gets user details from google account.
5. Gatekeeper redirects user to `rn-version-admin` with jwt token in query params. JWT tokens consists of user details from google account and custom user permissions added by gate service.

### How to enable auth via 3rd party service
1. Add the following environment variable to `.env` file:
```
REACT_APP_OAUTH_GATE_URL=https://gate-service.com
```
2. Update the `JWT_SECRET` environment variable. This variable is going to be used for JWT verification in callback method (when gate redirects user to `rn-version-admin` service).

### Example
1. Set `REACT_APP_OAUTH_GATE_URL` environment variable to `https://gate-service.com/auth/google?public_key=123&callback_url=https://rn-version-admin.com/api/v1/auth/gate/callback`.
2. Set `JWT_SECRET` environment variable to the one that is going to verify JWT token from gate service.
3. When user clicks "Login with google" in `rn-version-admin` login page he is redirected to gate url: `https://gate-service.com/auth/google?public_key=123&callback_url=https://rn-version-admin.com/api/v1/auth/gate/callback`.
4. Gate service checks that user exists by `public_key` in query params.
5. Gate service redirects user to google auth page.
6. When user clicks "Allow" he is redirected back to gate service.
7. Gate service creates a JWT token with user details from google account and permissions(managed by gate service).
8. Gate service redirects user to gate callback url in `rn-version-admin`: `https://rn-version-admin.com/api/v1/auth/gate/callback`. This address already exists in `rn-version-admin`.
9. Callback method in `rn-version-admin` checks that JWT token is valid, checks user permissions, checks that user exists in DB.
10. `rn-version-admin` service redirects user to home page with new JWT token which is used purely in `rn-version-admin`.
11. User is authorized and can see "versions" page.

## Docker
### How to run on local machine
```
make docker-run
```
NOTICE: you need to setup `.env` file in the project root and run mongo db locally as this command attaches container to host network.
### How to push build to remote docker registry
```
make docker-hub-upload HUB=YOUR_USERNAME
```
YOUR_USERNAME can be your login from [docker hub](https://hub.docker.com/) or a url to your own docker registry.


## How to run frontend tests
```
npm run frontend:test
```

## How to run backend integration tests
```
npm run backend:test
```
