import { AppModule } from '../src/app.module';
import { CreateNoteDto, UpdateNoteDto } from '../src/note/dto';
import { PrismaService } from '../src/prisma/prisma.service';
import { CreateUserDto, UserLoginDto } from '../src/auth/dto';
import { UpdateUserDto } from '../src/user/user.dto';
import { Tokens } from '../src/types';
import { HttpStatus, INestApplication, ValidationPipe, VersioningType } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { randomBytes } from 'crypto';
import * as pactum from 'pactum';
import { ExcludeProp } from '../src/helpers';
import { Note, User } from '@prisma/client';
import { EnvParsedConfig as config } from '../src/config';

type TokenKeys = keyof Tokens;

describe('End to end test', () => {
  let app: INestApplication, prisma: PrismaService;
  const TEST_SERVER_PORT = config.SERVER_PORT,
    API_VERSION = config.DEFAULT_API_VERSION,
    STORES_ACCESS_TOKEN = 'userAt',
    STORES_REFRESH_TOKEN = 'userRt';

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    app.enableVersioning({ type: VersioningType.URI, defaultVersion: API_VERSION });

    await app.init();
    await app.listen(TEST_SERVER_PORT);

    prisma = app.get(PrismaService);
    await prisma.cleanDb();

    pactum.request.setBaseUrl(`http://localhost:${TEST_SERVER_PORT}/v${API_VERSION}`);
  });

  afterAll(() => {
    app.close();
  });

  const testUserSignUp: CreateUserDto = {
    username: 'rikka12',
    firstname: 'Rikka',
    lastname: 'Takanashi',
    email: 'example01@xyz.com',
    password: 'foo bar',
  };

  describe('Authentication and Authorization', () => {
    const testUserSignIn: UserLoginDto = {
      email: testUserSignUp.email,
      password: testUserSignUp.password,
    };

    const jwtRegex = /^[A-Za-z0-9_-]{2,}(?:\.[A-Za-z0-9_-]{2,}){2}$/;

    const expectedAuthTokensJsonResponse: { [K in keyof Tokens]: RegExp } = {
      accessToken: jwtRegex,
      refreshToken: jwtRegex,
    };

    describe('Signup User', () => {
      it('should signup', async () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(testUserSignUp)
          .expectJsonLike(expectedAuthTokensJsonResponse)
          .expectStatus(HttpStatus.CREATED);
      });
      it('should throw if email empty', async () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({ ...testUserSignUp, email: '' } satisfies CreateUserDto)
          .expectStatus(HttpStatus.BAD_REQUEST);
      });
      it('should throw if name empty', async () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({ ...testUserSignUp, username: '' } satisfies CreateUserDto)
          .expectStatus(HttpStatus.BAD_REQUEST);
      });
      it('should throw if password empty', async () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({ ...testUserSignUp, password: '' } satisfies CreateUserDto)
          .expectStatus(HttpStatus.BAD_REQUEST);
      });
      it('should throw if firstname empty', async () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({ ...testUserSignUp, firstname: '' } satisfies CreateUserDto)
          .expectStatus(HttpStatus.BAD_REQUEST);
      });
      it('should throw if no body provided', async () => {
        return pactum.spec().post('/auth/signup').expectStatus(HttpStatus.BAD_REQUEST);
      });
    });
    describe('Signin User', () => {
      it('should signin', async () => {
        return await pactum
          .spec()
          .post('/auth/signin')
          .withBody(testUserSignIn)
          .expectJsonLike(expectedAuthTokensJsonResponse)
          .expectStatus(HttpStatus.OK)
          .stores((_, res) => ({
            [STORES_ACCESS_TOKEN]: res.body['accessToken' satisfies TokenKeys],
            [STORES_REFRESH_TOKEN]: res.body['refreshToken' satisfies TokenKeys],
          }));
      });
      it('should throw if email empty', async () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({ ...testUserSignUp, email: '' } satisfies UserLoginDto)
          .expectStatus(HttpStatus.BAD_REQUEST);
      });
      it('should throw if password empty', async () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({ ...testUserSignUp, password: '' } satisfies UserLoginDto)
          .expectStatus(HttpStatus.BAD_REQUEST);
      });
      it('should throw if no body provided', async () => {
        return pactum.spec().post('/auth/signin').expectStatus(HttpStatus.BAD_REQUEST);
      });
    });
    describe('Refresh auth tokens', () => {
      it('should refresh the tokens and return valid json object', async () => {
        return pactum
          .spec()
          .post('/auth/refresh')
          .withHeaders('Authorization', `Bearer $S{${STORES_REFRESH_TOKEN}}`)
          .expectJsonLike(expectedAuthTokensJsonResponse)
          .expectStatus(HttpStatus.OK)
          .stores((_, res) => ({
            [STORES_REFRESH_TOKEN]: res.body['refreshToken' satisfies TokenKeys],
          }));
      });
      it('should throw if wrong token is provided', async () => {
        return pactum
          .spec()
          .post('/auth/refresh')
          .withHeaders('Authorization', `Bearer $S{${STORES_ACCESS_TOKEN}}`)
          .expectStatus(HttpStatus.UNAUTHORIZED);
      });
    });
  });
  describe('User endpoint', () => {
    const testUpdateUser: UpdateUserDto = {
      username: 'chita23',
      firstname: 'Eru',
      lastname: 'Chitanda',
    };
    describe('Fetch user info', () => {
      it('should get current user', async () => {
        return pactum
          .spec()
          .get('/users/me')
          .withHeaders('Authorization', `Bearer $S{${STORES_ACCESS_TOKEN}}`) //* parameter bisa berbentuk object
          .expectJsonLike({
            username: testUserSignUp.username,
            firstname: testUserSignUp.firstname,
            lastname: testUserSignUp.lastname,
          } satisfies Partial<User>)
          .expectStatus(HttpStatus.OK);
      });
      it('should throw unauthorized if no auth token is provided', async () => {
        return pactum.spec().get('/users/me').expectStatus(HttpStatus.UNAUTHORIZED);
      });
      it('Edit user info', async () => {
        return pactum
          .spec()
          .patch('/users')
          .withHeaders('Authorization', `Bearer $S{${STORES_ACCESS_TOKEN}}`)
          .withBody(testUpdateUser)
          .expectJsonMatchStrict(testUpdateUser)
          .expectStatus(HttpStatus.OK);
      });
    });
  });
  describe('Notes endpoint', () => {
    const testCreateNote: CreateNoteDto = {
      title: 'Foo',
      description: 'Foo Bar',
    };
    const testUpdateNote: UpdateNoteDto = {
      title: 'Any note',
      description: 'Any note Description',
    };
    const STORES_NOTE_ID = 'noteId';
    type NoteWithoutUserId = ExcludeProp<Note, 'userId'>;

    describe('Notes CRUD', () => {
      describe('Get empty notes', () => {
        it('should get empty notes', async () => {
          return pactum
            .spec()
            .get('/notes')
            .withHeaders('Authorization', `Bearer $S{${STORES_ACCESS_TOKEN}}`)
            .expectStatus(HttpStatus.OK)
            .expectBody([])
            .expectJsonLength(0);
        });
      });
      describe('Create note', () => {
        it('should create note', async () => {
          return pactum
            .spec()
            .post('/notes')
            .withHeaders('Authorization', `Bearer $S{${STORES_ACCESS_TOKEN}}`)
            .withBody(testCreateNote)
            .expectStatus(HttpStatus.CREATED)
            .expectJsonMatch({ ...testCreateNote })
            .stores((_, res) => ({
              [STORES_NOTE_ID]: res.body['id' satisfies keyof NoteWithoutUserId],
            }));
          //* menyimpan nilai id note pada variabel noteId
        });
      });
      describe('Get notes', () => {
        it('should get notes', async () => {
          return pactum
            .spec()
            .get('/notes')
            .withHeaders('Authorization', `Bearer $S{${STORES_ACCESS_TOKEN}}`)
            .expectStatus(HttpStatus.OK)
            .expectJsonLength(1)
            .expectJsonMatch([{ ...testCreateNote }]);
        });
      });
      describe('Get note by id', () => {
        it('should get note by id', async () => {
          //* $S{nama_variabel} adalah cara khusus untuk mengambil nilai yang di store/tersimpan
          //* pada variabel tertentu pada library pactum
          return pactum
            .spec()
            .get(`/notes`)
            .withHeaders('Authorization', `Bearer $S{${STORES_ACCESS_TOKEN}}`)
            .withQueryParams({ noteId: `$S{${STORES_NOTE_ID}}` })
            .expectStatus(HttpStatus.OK)
            .expectJsonMatch({ ...testCreateNote });
        });
      });
      describe('Update note by id', () => {
        it('should update note by id', async () => {
          return pactum
            .spec()
            .patch(`/notes`)
            .withHeaders('Authorization', `Bearer $S{${STORES_ACCESS_TOKEN}}`)
            .withQueryParams({ noteId: `$S{${STORES_NOTE_ID}}` })
            .withBody(testUpdateNote)
            .expectStatus(HttpStatus.OK)
            .expectJsonMatch({ ...testUpdateNote });
        });
        it('should response not found if an unknown note id is provided', async () => {
          const randomHex: string = randomBytes(12).toString('hex');
          return pactum
            .spec()
            .patch(`/notes`)
            .withHeaders('Authorization', `Bearer $S{${STORES_ACCESS_TOKEN}}`)
            .withQueryParams({ noteId: `${randomHex}` })
            .withBody(testUpdateNote)
            .expectStatus(HttpStatus.NOT_FOUND);
        });
      });
      describe('Delete note by id', () => {
        it('should delete note by id', async () => {
          return pactum
            .spec()
            .delete(`/notes`)
            .withHeaders('Authorization', `Bearer $S{${STORES_ACCESS_TOKEN}}`)
            .withQueryParams({ noteId: `$S{${STORES_NOTE_ID}}` })
            .expectStatus(HttpStatus.NO_CONTENT);
        });
        it('should get empty notes', async () => {
          return pactum
            .spec()
            .get('/notes')
            .withHeaders('Authorization', `Bearer $S{${STORES_ACCESS_TOKEN}}`)
            .expectStatus(HttpStatus.OK)
            .expectBody([])
            .expectJsonLength(0);
        });
      });
    });
  });
});
