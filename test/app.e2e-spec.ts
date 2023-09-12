import {
  getRandomUser,
  getRandomNote,
  pactumStoresAuthHeader,
  pactumStoresSetQueryParam,
  pactumStoresQueryParam,
} from './utils';
import { HttpStatus, INestApplication, ValidationPipe, VersioningType } from '@nestjs/common';
import { Tokens, UserInfo, tokenName, noteQueryParamName } from 'src/types';
import { CreateUserDto, UserLoginDto } from 'src/auth/dto';
import { EnvParsedConfig as config } from 'src/config';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateUserDto } from 'src/user/dto';
import { AppModule } from 'src/app.module';
import { Test } from '@nestjs/testing';
import { Note } from '@prisma/client';
import { randomBytes } from 'crypto';
import * as pactum from 'pactum';
import { tokensSchema } from 'src/schema';

describe('End to end test', () => {
  let app: INestApplication, prisma: PrismaService;
  const TEST_SERVER_PORT = config.SERVER_PORT,
    API_VERSION = config.DEFAULT_API_VERSION;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    app.enableVersioning({ type: VersioningType.URI, defaultVersion: API_VERSION });
    app.setGlobalPrefix('/api', { exclude: ['/'] });

    await app.init();
    await app.listen(TEST_SERVER_PORT);

    prisma = app.get(PrismaService);
    await prisma.cleanDb();

    pactum.request.setBaseUrl(`http://localhost:${TEST_SERVER_PORT}/api/v${API_VERSION}`);
  });

  afterAll(() => {
    app.close();
  });

  const TEST_USER_1 = getRandomUser(),
    TEST_USER_2 = getRandomUser(),
    TEST_NOTE_1 = getRandomNote(),
    TEST_NOTE_2 = getRandomNote();

  describe('Authentication and Authorization', () => {
    describe('User Signup', () => {
      it('should throw if email empty', async () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({ ...TEST_USER_1, email: '' } satisfies CreateUserDto)
          .expectStatus(HttpStatus.BAD_REQUEST);
      });
      it('should throw if name empty', async () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({ ...TEST_USER_1, username: '' } satisfies CreateUserDto)
          .expectStatus(HttpStatus.BAD_REQUEST);
      });
      it('should throw if password empty', async () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({ ...TEST_USER_1, password: '' } satisfies CreateUserDto)
          .expectStatus(HttpStatus.BAD_REQUEST);
      });
      it('should throw if firstname empty', async () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({ ...TEST_USER_1, firstname: '' } satisfies CreateUserDto)
          .expectStatus(HttpStatus.BAD_REQUEST);
      });
      it('should throw if no body provided', async () => {
        return pactum.spec().post('/auth/signup').expectStatus(HttpStatus.BAD_REQUEST);
      });
      it('should create new user', async () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(TEST_USER_1)
          .expect(({ res }) => tokensSchema.parse(res.json))
          .expectStatus(HttpStatus.CREATED);
      });
      it('should throw a conflict response when user signs up with existing/duplicate account', async () => {
        return pactum.spec().post('/auth/signup').withBody(TEST_USER_1).expectStatus(HttpStatus.CONFLICT);
      });
    });
    describe('User Signin', () => {
      it('should throw if email empty', async () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({ ...TEST_USER_1, email: '' } satisfies UserLoginDto)
          .expectStatus(HttpStatus.BAD_REQUEST);
      });
      it('should throw if password empty', async () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({ ...TEST_USER_1, password: '' } satisfies UserLoginDto)
          .expectStatus(HttpStatus.BAD_REQUEST);
      });
      it('should throw a bad request response if no body or request payload is provided', async () => {
        return pactum.spec().post('/auth/signin').expectStatus(HttpStatus.BAD_REQUEST);
      });
      it('should signin', async () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({
            email: TEST_USER_1.email,
            password: TEST_USER_1.password,
          } satisfies UserLoginDto)
          .expect(({ res }) => tokensSchema.parse(res.json))
          .expectStatus(HttpStatus.OK)
          .stores((_, res) => {
            const body = res.body as Record<keyof Tokens, string>;
            return {
              [tokenName.ACCESSTOKEN]: body.accessToken,
              [tokenName.REFRESHTOKEN]: body.refreshToken,
            };
          });
      });
    });
    describe('Refresh auth tokens', () => {
      it('should refresh the tokens and return valid json object', async () => {
        return pactum
          .spec()
          .post('/auth/refresh')
          .withHeaders(pactumStoresAuthHeader('refreshToken'))
          .expect(({ res }) => tokensSchema.parse(res.json))
          .expectStatus(HttpStatus.OK)
          .stores((_, res) => {
            const body = res.body as Record<keyof Tokens, string>;
            return { [tokenName.REFRESHTOKEN]: body.refreshToken };
          });
      });
      it('should throw a unauthorized response if wrong token is provided', async () => {
        return pactum
          .spec()
          .post('/auth/refresh')
          .withHeaders(pactumStoresAuthHeader('accessToken'))
          .expectStatus(HttpStatus.UNAUTHORIZED);
      });
    });
    describe('User Logout', () => {
      it('should logout the user', async () => {
        return pactum
          .spec()
          .post('/auth/logout')
          .withHeaders(pactumStoresAuthHeader('accessToken'))
          .expectStatus(HttpStatus.NO_CONTENT);
      });
      it('should signin the user', async () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({
            email: TEST_USER_1.email,
            password: TEST_USER_1.password,
          } satisfies UserLoginDto)
          .expect(({ res }) => tokensSchema.parse(res.json))
          .expectStatus(HttpStatus.OK)
          .stores((_, res) => {
            const body = res.body as Record<keyof Tokens, string>;
            return {
              [tokenName.ACCESSTOKEN]: body.accessToken,
              [tokenName.REFRESHTOKEN]: body.refreshToken,
            };
          });
      });
    });
  });
  describe('User endpoint', () => {
    /**
      "body": {
        "username": "lgribbinc",
        "firstname": "Trace",
        "lastname": "Douglas",
        "email": "yraigatt3@nature.com",
        "createdAt": "2023-09-11T00:36:57.297Z",
        "updatedAt": "2023-09-11T00:36:59.047Z"
      }
    */
    describe('Fetch user information', () => {
      it('should get current user information', async () => {
        return pactum
          .spec()
          .get('/users/me')
          .withHeaders(pactumStoresAuthHeader('accessToken')) //* parameter bisa berbentuk object
          .expectStatus(HttpStatus.OK)
          .expect(({ res }) => {
            expect(res.json).toMatchObject<Partial<UserInfo>>({
              username: TEST_USER_1.username,
              firstname: TEST_USER_1.firstname,
              lastname: TEST_USER_1.lastname,
              email: TEST_USER_1.email,
            });
          });
      });
      it('should throw a unauthorized response if no auth token is provided', async () => {
        return pactum.spec().get('/users/me').expectStatus(HttpStatus.UNAUTHORIZED);
      });
    });
    describe('Update user information', () => {
      const userUpdate: UpdateUserDto = {
        username: TEST_USER_2.username,
        firstname: TEST_USER_2.firstname,
        lastname: TEST_USER_2.lastname,
      };
      it('should update user info', async () => {
        return pactum
          .spec()
          .patch('/users')
          .withHeaders(pactumStoresAuthHeader('accessToken'))
          .withBody(userUpdate)
          .expectJsonMatchStrict(userUpdate)
          .expectStatus(HttpStatus.OK);
      });
      it('should get current correct user information', async () => {
        return pactum
          .spec()
          .get('/users/me')
          .withHeaders(pactumStoresAuthHeader('accessToken'))
          .expectStatus(HttpStatus.OK)
          .expect(({ res }) => {
            expect(res.json).toMatchObject<Partial<UserInfo>>(userUpdate);
          });
      });
    });
  });
  describe('Notes endpoint', () => {
    describe('Notes CRUD', () => {
      it('should get empty notes', async () => {
        return pactum
          .spec()
          .get('/notes')
          .withHeaders(pactumStoresAuthHeader('accessToken'))
          .expectStatus(HttpStatus.OK)
          .expectBody([])
          .expectJsonLength(0);
      });
      it('should create a new note', async () => {
        return pactum
          .spec()
          .post('/notes')
          .withHeaders(pactumStoresAuthHeader('accessToken'))
          .withBody(TEST_NOTE_1)
          .expectStatus(HttpStatus.CREATED)
          .expectJsonMatch(TEST_NOTE_1)
          .stores((_, res) => {
            const body = res.body as Note;
            return { [noteQueryParamName.NOTEID]: body.id };
          });
        //* menyimpan nilai id catatan pada variabel pactum stores noteId
      });
      it('should get notes', async () => {
        return pactum
          .spec()
          .get('/notes')
          .withHeaders(pactumStoresAuthHeader('accessToken'))
          .expectStatus(HttpStatus.OK)
          .expectJsonLength(1)
          .expectJsonMatch([TEST_NOTE_1]);
      });
      it('should get note by id', async () => {
        //* $S{nama_variabel} adalah cara khusus untuk mengambil nilai yang di store/tersimpan
        //* pada variabel tertentu pada library pactum
        return pactum
          .spec()
          .get('/notes')
          .withHeaders(pactumStoresAuthHeader('accessToken'))
          .withQueryParams(pactumStoresQueryParam('noteId'))
          .expectStatus(HttpStatus.OK)
          .expectJsonLength(1)
          .expectJsonMatch([TEST_NOTE_1]);
      });
      describe('Update note by id', () => {
        it('should update note by id', async () => {
          return pactum
            .spec()
            .patch('/notes')
            .withHeaders(pactumStoresAuthHeader('accessToken'))
            .withQueryParams(pactumStoresQueryParam('noteId'))
            .withBody(TEST_NOTE_2)
            .expectStatus(HttpStatus.OK)
            .expectJsonMatch(TEST_NOTE_2);
        });
        it('should throw a not found response if an unknown note id is provided', async () => {
          const randomHex: string = randomBytes(12).toString('hex');
          return pactum
            .spec()
            .patch('/notes')
            .withHeaders(pactumStoresAuthHeader('accessToken'))
            .withQueryParams(pactumStoresSetQueryParam('noteId', randomHex))
            .withBody(TEST_NOTE_2)
            .expectStatus(HttpStatus.NOT_FOUND);
        });
      });
      describe('Delete note by id', () => {
        it('should delete note by id', async () => {
          return pactum
            .spec()
            .delete('/notes')
            .withHeaders(pactumStoresAuthHeader('accessToken'))
            .withQueryParams(pactumStoresQueryParam('noteId'))
            .expectStatus(HttpStatus.NO_CONTENT);
        });
        it('should get empty notes', async () => {
          return pactum
            .spec()
            .get('/notes')
            .withHeaders(pactumStoresAuthHeader('accessToken'))
            .expectStatus(HttpStatus.OK)
            .expectBody([])
            .expectJsonLength(0);
        });
      });
    });
  });
});
