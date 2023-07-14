import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import * as pactum from 'pactum';
import { CreateUserDto, UserLoginDto } from '../src/auth/dto';
import { UpdateUserDto } from '../src/user/user.dto';
import { CreateNoteDto, UpdateNoteDto } from '../src/note/dto';

describe('App e2e', () => {
  let app: INestApplication, prisma: PrismaService;
  const TEST_SERVER_PORT = 5000;
  const STORES_ACCESS_TOKEN = 'userAt';
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
    await app.listen(TEST_SERVER_PORT);

    prisma = app.get(PrismaService);
    await prisma.cleanDb();

    pactum.request.setBaseUrl(`http://localhost:${TEST_SERVER_PORT}`);
  });

  afterAll(() => {
    app.close();
  });

  describe('Auth', () => {
    const testUserSignUp: CreateUserDto = {
      name: 'Rikka Takanashi',
      email: 'example01@xyz.com',
      password: 'foo bar',
    };
    const testUserSignIn: UserLoginDto = {
      email: testUserSignUp.email,
      password: testUserSignUp.password,
    };

    const jwtRegex = /^[A-Za-z0-9_-]{2,}(?:\.[A-Za-z0-9_-]{2,}){2}$/;

    describe('Signup', () => {
      it('should signup', async () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(testUserSignUp)
          .expectJsonLike({
            access_token: jwtRegex,
          })
          .expectStatus(201);
      });
      it('should throw if email empty', async () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({ ...testUserSignUp, email: '' } as CreateUserDto)
          .expectStatus(400);
      });
      it('should throw if name empty', async () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({ ...testUserSignUp, name: '' } as CreateUserDto)
          .expectStatus(400);
      });
      it('should throw if password empty', async () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({ ...testUserSignUp, password: '' } as CreateUserDto)
          .expectStatus(400);
      });
      it('should throw if no body provided', async () => {
        return pactum.spec().post('/auth/signup').expectStatus(400);
      });
    });
    describe('Signin', () => {
      it('should signin', async () => {
        return await pactum
          .spec()
          .post('/auth/signin')
          .withBody(testUserSignIn)
          .expectJsonLike({
            access_token: jwtRegex,
          })
          .expectStatus(200)
          .stores(STORES_ACCESS_TOKEN, 'access_token');
      });
      it('should throw if email empty', async () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({ ...testUserSignUp, email: '' } as UserLoginDto)
          .expectStatus(400);
      });
      it('should throw if password empty', async () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({ ...testUserSignUp, password: '' } as UserLoginDto)
          .expectStatus(400);
      });
      it('should throw if no body provided', async () => {
        return pactum.spec().post('/auth/signin').expectStatus(400);
      });
    });
  });
  describe('User', () => {
    const testUpdateUser: UpdateUserDto = {
      name: 'Nezuko Kamado',
    };
    it('should get current user', async () => {
      return pactum
        .spec()
        .get('/users/me')
        .withHeaders('Authorization', `Bearer $S{${STORES_ACCESS_TOKEN}}`) //* parameter bisa berbentuk object
        .expectStatus(200);
    });
    it('should throw unauthorized response', async () => {
      return pactum.spec().get('/users/me').expectStatus(401).expectJsonMatch({
        message: 'Unauthorized',
      });
    });
    it('should edit user', async () => {
      return pactum
        .spec()
        .patch('/users')
        .withHeaders('Authorization', `Bearer $S{${STORES_ACCESS_TOKEN}}`)
        .withBody(testUpdateUser)
        .expectStatus(200)
        .expectJsonMatch({ ...testUpdateUser });
    });
  });
  describe('Notes', () => {
    const testCreateNote: CreateNoteDto = {
      title: 'Foo',
      description: 'Foo Bar',
    };
    const testUpdateNote: UpdateNoteDto = {
      title: 'Any note',
      description: 'Any note Description',
    };
    const STORES_NOTE_ID = 'noteId';

    describe('Get empty notes', () => {
      it('should get notes', async () => {
        return pactum
          .spec()
          .get('/notes')
          .withHeaders('Authorization', `Bearer $S{${STORES_ACCESS_TOKEN}}`)
          .expectStatus(200)
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
          .expectStatus(201)
          .expectJsonMatch({ ...testCreateNote })
          .stores(STORES_NOTE_ID, 'id');
        //* menyimpan nilai id note pada variabel noteId
      });
    });
    describe('Get notes', () => {
      it('should get notes', async () => {
        return pactum
          .spec()
          .get('/notes')
          .withHeaders('Authorization', `Bearer $S{${STORES_ACCESS_TOKEN}}`)
          .expectStatus(200)
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
          .get(`/notes/$S{${STORES_NOTE_ID}}`)
          .withHeaders('Authorization', `Bearer $S{${STORES_ACCESS_TOKEN}}`)
          .withPathParams('id', `$S{${STORES_NOTE_ID}}`)
          .expectStatus(200)
          .expectJsonMatch({ ...testCreateNote });
      });
    });
    describe('Update note by id', () => {
      it('should update note by id', async () => {
        return pactum
          .spec()
          .patch(`/notes/$S{${STORES_NOTE_ID}}`)
          .withHeaders('Authorization', `Bearer $S{${STORES_ACCESS_TOKEN}}`)
          .withPathParams('id', `$S{${STORES_NOTE_ID}}`)
          .withBody(testUpdateNote)
          .expectStatus(200)
          .expectJsonMatch({ ...testUpdateNote });
      });
      it('should throw an error if an unknown note id is provided', async () => {
        return pactum
          .spec()
          .patch(`/notes/64ae31870c09330399b64346`)
          .withHeaders('Authorization', `Bearer $S{${STORES_ACCESS_TOKEN}}`)
          .withPathParams('id', `$S{${STORES_NOTE_ID}}`)
          .withBody(testUpdateNote)
          .expectStatus(403);
      });
    });
    describe('Delete note by id', () => {
      it('should delete note by id', async () => {
        return pactum
          .spec()
          .delete(`/notes/$S{${STORES_NOTE_ID}}`)
          .withHeaders('Authorization', `Bearer $S{${STORES_ACCESS_TOKEN}}`)
          .expectStatus(204);
      });
      it('should get empty notes', async () => {
        return pactum
          .spec()
          .get('/notes')
          .withHeaders('Authorization', `Bearer $S{${STORES_ACCESS_TOKEN}}`)
          .expectStatus(200)
          .expectBody([])
          .expectJsonLength(0);
      });
    });
  });
});
