import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import * as pactum from 'pactum';
import { CreateUserDto, UserLoginDto } from '../src/auth/auth.dto';

describe('App e2e', () => {
  let app: INestApplication, prisma: PrismaService;
  const TEST_SERVER_PORT = 3000;
  const USER_ACCESS_TOKEN = 'userAt';
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
    const userSignUpData: CreateUserDto = {
      name: 'John Doe',
      email: 'example01@xyz.com',
      password: 'foo bar',
    };
    const userSignInData: UserLoginDto = {
      email: userSignUpData.email,
      password: userSignUpData.password,
    };

    const jwtRegex = /^[A-Za-z0-9_-]{2,}(?:\.[A-Za-z0-9_-]{2,}){2}$/;

    describe('Signup', () => {
      it('should signup', async () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(userSignUpData)
          .expectJsonLike({
            access_token: jwtRegex,
          })
          .expectStatus(201);
      });
      it('should throw if email empty', async () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({ ...userSignUpData, email: '' } as CreateUserDto)
          .expectStatus(400);
      });
      it('should throw if name empty', async () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({ ...userSignUpData, name: '' } as CreateUserDto)
          .expectStatus(400);
      });
      it('should throw if password empty', async () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({ ...userSignUpData, password: '' } as CreateUserDto)
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
          .withBody(userSignInData)
          .expectJsonLike({
            access_token: jwtRegex,
          })
          .expectStatus(200)
          .stores(USER_ACCESS_TOKEN, 'access_token');
      });
      it('should throw if email empty', async () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({ ...userSignUpData, email: '' } as UserLoginDto)
          .expectStatus(400);
      });
      it('should throw if password empty', async () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({ ...userSignUpData, password: '' } as UserLoginDto)
          .expectStatus(400);
      });
      it('should throw if no body provided', async () => {
        return pactum.spec().post('/auth/signin').expectStatus(400);
      });
    });
  });
  describe('User', () => {
    it('should get current user', async () => {
      return pactum
        .spec()
        .get('/users/me')
        .withHeaders('Authorization', `Bearer $S{${USER_ACCESS_TOKEN}}`) //* parameter bisa berbentuk object
        .expectStatus(200);
    });
  });
  describe('Note', () => {
    it.todo('pass');
  });
});
