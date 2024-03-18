import request from 'supertest';

import app from '../src/server/index.js'; // Adjust the path as necessary to import your Express app

describe('GET /rover/:name', function () {
  it('responds with JSON containing rover data for a valid rover name', function (done) {
    request(app)
      .get('/rover/curiosity')
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function (err, res) {
        if (err) return done(err);

        // Perform more specific checks here, e.g. check for certain keys in the response
        expect(res.body).toBeDefined();
        expect(res.body.latest_photos).toBeDefined();
        expect(Array.isArray(res.body.latest_photos)).toBe(true);
        done();
      });
  });

  it('responds with an error for an invalid rover name', function (done) {
    request(app)
      .get('/rover/invalidRoverName')
      .expect('Content-Type', /json/)
      .expect(404) // Assuming your API responds with a 500 error for invalid rover names
      .end(function (err, res) {
        if (err) return done(err);

        expect(res.body.error).toBeDefined();
        expect(res.body.error).toBe('Rover not found');
        done();
      });
  });
});
