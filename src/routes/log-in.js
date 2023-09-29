const { getUserByEmail } = require('../model/user.js');
const { Layout } = require('../templates.js');
const bcrypt = require('bcryptjs');
// const { createUser } = require('../model/user.js');
const { createSession } = require('../model/session.js');

function get(req, res) {
  const title = 'Log in to your account';
  const content = /*html*/ `
    <div class="Cover">
      <h1>${title}</h1>
      <form method="POST" class="Row">
        <div class="Stack" style="--gap: 0.25rem">
          <label for="email">email</label>
          <input type="email" id="email" name="email" required>
        </div>
        <div class="Stack" style="--gap: 0.25rem">
          <label for="password">password</label>
          <input type="password" id="password" name="password" required>
        </div>
        <button class="Button">Log in</button>
      </form>
    </div>
  `;
  const body = Layout({ title, content });
  res.send(body);
}

function post(req, res) {
  const { email, password } = req.body;
  const user = getUserByEmail(email);
  if (!email || !password || !user) {
    return res.status(400).send('<h1>Login failed</h1>');
  }
  bcrypt.compare(password, user.hash).then((matching) => {
    if (!matching) {
      return res.status(400).send('<h1>Login failed</h1>');
    } else {
      const session_id = createSession(user.id);
      res.cookie('sid', session_id, {
        signed: true,
        maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
        sameSite: 'lax',
        httpOnly: true,
      });
      // Why don't we redirect to their session ID?
      res.redirect(`/confessions/${user.id}`);
    }
  });
  // res.send("to-do");
  /**
   * [1] Compare submitted password to stored hash
   * [2] If no match redirect back to same page so user can retry
   * [3] If match create a session with their user ID,
   *     set a cookie with the session ID,
   *     redirect to the user's confession page (e.g. /confessions/3)
   */
}

module.exports = { get, post };
