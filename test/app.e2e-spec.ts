import { HttpStatus, INestApplication, ValidationPipe, VersioningType } from '@nestjs/common';
import { CreateNoteDto, UpdateNoteDto } from 'src/note/dto';
import { CreateUserDto, UserLoginDto } from 'src/auth/dto';
import { NoteQueryParamKeys, Tokens } from 'src/types';
import { EnvParsedConfig as config } from 'src/config';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateUserDto } from 'src/user/dto';
import { AppModule } from 'src/app.module';
import { randomBytes } from 'crypto';
import * as pactum from 'pactum';
import { Test } from '@nestjs/testing';
import { z } from 'zod';

const TEST_SERVER_PORT = config.SERVER_PORT,
  API_VERSION = config.DEFAULT_API_VERSION,
  PACTUM_STORES_ACCESS_TOKEN = 'access_token',
  PACTUM_STORES_REFRESH_TOKEN = 'refresh_token',
  PACTUM_STORES_NOTE_ID = 'noteId';

const user__yuuki: Partial<CreateUserDto> = {
  username: 'yuuki16',
  firstname: 'Asuna',
  lastname: 'Yuuki',
};

const user__chitanda: UpdateUserDto = {
  username: 'chita23',
  firstname: 'Eru',
  lastname: 'Chitanda',
};

const userCredentials: Partial<CreateUserDto> = {
  email: 'example001@xyz.com',
  password: 'foo_bar',
};

const note__goToMarket: CreateNoteDto = {
  title: 'Pergi ke pasar',
  description: 'Beli bawang putih 150kg',
};

const note__updatedShoppingList: UpdateNoteDto = {
  description: 'Beli bawang putih 150kg\nkentang 200kg',
};

const tokensSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
} satisfies Record<keyof Tokens, z.ZodString>);

const authHeader = (authToken: keyof Tokens) => {
  switch (authToken) {
    case 'accessToken':
      return { ['Authorization']: `Bearer $S{${PACTUM_STORES_ACCESS_TOKEN}}` };
    case 'refreshToken':
      return { ['Authorization']: `Bearer $S{${PACTUM_STORES_REFRESH_TOKEN}}` };
  }
  authToken satisfies never;
};

type QueryParamKeys = NoteQueryParamKeys;
const queryParam = (param: QueryParamKeys, value?: any): { [K in QueryParamKeys]?: any } => {
  switch (param) {
    case 'noteId':
      return { noteId: value ? value : `$S{${PACTUM_STORES_NOTE_ID}}` };
  }
  param satisfies never;
};

describe('End to end test', () => {
  let app: INestApplication, prisma: PrismaService;

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

  describe('Authentication and Authorization', () => {
    describe('User Signup', () => {
      it('should throw if email empty', async () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({ ...user__yuuki, ...userCredentials, email: '' } satisfies Partial<CreateUserDto>)
          .expectStatus(HttpStatus.BAD_REQUEST);
      });
      it('should throw if name empty', async () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            ...user__yuuki,
            ...userCredentials,
            username: '',
          } satisfies Partial<CreateUserDto>)
          .expectStatus(HttpStatus.BAD_REQUEST);
      });
      it('should throw if password empty', async () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            ...user__yuuki,
            ...userCredentials,
            password: '',
          } satisfies Partial<CreateUserDto>)
          .expectStatus(HttpStatus.BAD_REQUEST);
      });
      it('should throw if firstname empty', async () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            ...user__yuuki,
            ...userCredentials,
            firstname: '',
          } satisfies Partial<CreateUserDto>)
          .expectStatus(HttpStatus.BAD_REQUEST);
      });
      it('should throw if no body provided', async () => {
        return pactum.spec().post('/auth/signup').expectStatus(HttpStatus.BAD_REQUEST);
      });
      it('should create new user', async () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({ ...user__yuuki, ...userCredentials })
          .expect(({ res }) => tokensSchema.parse(res.json))
          .expectStatus(HttpStatus.CREATED);
      });
    });
    describe('User Signin', () => {
      it('should throw if email empty', async () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({ ...user__yuuki, ...userCredentials, email: '' } satisfies Partial<UserLoginDto>)
          .expectStatus(HttpStatus.BAD_REQUEST);
      });
      it('should throw if password empty', async () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({
            ...user__yuuki,
            ...userCredentials,
            password: '',
          } satisfies Partial<UserLoginDto>)
          .expectStatus(HttpStatus.BAD_REQUEST);
      });
      it('should throw if no body provided', async () => {
        return pactum.spec().post('/auth/signin').expectStatus(HttpStatus.BAD_REQUEST);
      });
      it('should signin', async () => {
        return await pactum
          .spec()
          .post('/auth/signin')
          .withBody(userCredentials)
          .expect(({ res }) => tokensSchema.parse(res.json))
          .expectStatus(HttpStatus.OK)
          .stores((_, res) => ({
            [PACTUM_STORES_ACCESS_TOKEN]: res.body['accessToken' satisfies keyof Tokens],
            [PACTUM_STORES_REFRESH_TOKEN]: res.body['refreshToken' satisfies keyof Tokens],
          }));
      });
    });
    describe('Refresh auth tokens', () => {
      it('should refresh the tokens and return valid json object', async () => {
        return pactum
          .spec()
          .post('/auth/refresh')
          .withHeaders(authHeader('refreshToken'))
          .expect(({ res }) => tokensSchema.parse(res.json))
          .expectStatus(HttpStatus.OK)
          .stores((_, res) => ({
            [PACTUM_STORES_REFRESH_TOKEN]: res.body['refreshToken' satisfies keyof Tokens],
          }));
      });
      it('should throw if wrong token is provided', async () => {
        return pactum
          .spec()
          .post('/auth/refresh')
          .withHeaders(authHeader('accessToken'))
          .expectStatus(HttpStatus.UNAUTHORIZED);
      });
    });
    describe('User Logout', () => {
      it('should logout the user', async () => {
        return pactum
          .spec()
          .post('/auth/logout')
          .withHeaders(authHeader('accessToken'))
          .expectStatus(HttpStatus.NO_CONTENT);
      });
      it('should signin the user', async () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody(userCredentials)
          .expect(({ res }) => tokensSchema.parse(res.json))
          .expectStatus(HttpStatus.OK)
          .stores((_, res) => ({
            [PACTUM_STORES_ACCESS_TOKEN]: res.body['accessToken' satisfies keyof Tokens],
            [PACTUM_STORES_REFRESH_TOKEN]: res.body['refreshToken' satisfies keyof Tokens],
          }));
      });
    });
  });
  describe('User endpoint', () => {
    describe('Fetch user info', () => {
      it('should get current user', async () => {
        return pactum
          .spec()
          .get('/users/me')
          .withHeaders(authHeader('accessToken')) //* parameter bisa berbentuk object
          .expectStatus(HttpStatus.OK)
          .expect(({ res }) => {
            const checkIfResponseObjectIsValid = Object.keys(user__yuuki).every((key) =>
              res.json ? res.json[key] === user__yuuki[key] : false,
            );
            if (checkIfResponseObjectIsValid) return;
            throw new Error('invalid response');
          });
      });
      it('should throw unauthorized if no auth token is provided', async () => {
        return pactum.spec().get('/users/me').expectStatus(HttpStatus.UNAUTHORIZED);
      });
      it('Edit user info', async () => {
        return pactum
          .spec()
          .patch('/users')
          .withHeaders(authHeader('accessToken'))
          .withBody(user__chitanda)
          .expectJsonMatchStrict(user__chitanda)
          .expectStatus(HttpStatus.OK);
      });
    });
  });
  describe('Notes endpoint', () => {
    describe('Notes CRUD', () => {
      it('should get empty notes', async () => {
        return pactum
          .spec()
          .get('/notes')
          .withHeaders(authHeader('accessToken'))
          .expectStatus(HttpStatus.OK)
          .expectBody([])
          .expectJsonLength(0);
      });
      it('should create note', async () => {
        return pactum
          .spec()
          .post('/notes')
          .withHeaders(authHeader('accessToken'))
          .withBody(note__goToMarket)
          .expectStatus(HttpStatus.CREATED)
          .expectJsonMatch(note__goToMarket)
          .stores((_, res) => ({
            [PACTUM_STORES_NOTE_ID]: res.body['id'],
          }));
        //* menyimpan nilai id note pada variabel noteId
      });
      it('should get notes', async () => {
        return pactum
          .spec()
          .get('/notes')
          .withHeaders(authHeader('accessToken'))
          .expectStatus(HttpStatus.OK)
          .expectJsonLength(1)
          .expectJsonMatch([note__goToMarket]);
      });
      it('should get note by id', async () => {
        //* $S{nama_variabel} adalah cara khusus untuk mengambil nilai yang di store/tersimpan
        //* pada variabel tertentu pada library pactum
        return pactum
          .spec()
          .get('/notes')
          .withHeaders(authHeader('accessToken'))
          .withQueryParams(queryParam('noteId'))
          .expectStatus(HttpStatus.OK)
          .expectJsonLength(1)
          .expectJsonMatch([note__goToMarket]);
      });
      describe('Update note by id', () => {
        it('should update note by id', async () => {
          return pactum
            .spec()
            .patch('/notes')
            .withHeaders(authHeader('accessToken'))
            .withQueryParams(queryParam('noteId'))
            .withBody(note__updatedShoppingList)
            .expectStatus(HttpStatus.OK)
            .expectJsonMatch(note__updatedShoppingList);
        });
        it('should response not found if an unknown note id is provided', async () => {
          const randomHex: string = randomBytes(12).toString('hex');
          return pactum
            .spec()
            .patch('/notes')
            .withHeaders(authHeader('accessToken'))
            .withQueryParams(queryParam('noteId', randomHex))
            .withBody(note__updatedShoppingList)
            .expectStatus(HttpStatus.NOT_FOUND);
        });
      });
      describe('Delete note by id', () => {
        it('should delete note by id', async () => {
          return pactum
            .spec()
            .delete('/notes')
            .withHeaders(authHeader('accessToken'))
            .withQueryParams(queryParam('noteId'))
            .expectStatus(HttpStatus.NO_CONTENT);
        });
        it('should get empty notes', async () => {
          return pactum
            .spec()
            .get('/notes')
            .withHeaders(authHeader('accessToken'))
            .expectStatus(HttpStatus.OK)
            .expectBody([])
            .expectJsonLength(0);
        });
      });
    });
  });
});
