import express from 'express';
import { join, dirname } from 'path';
import { apiUrlBase } from '../lib/constants';
import { createDemoUrl } from './server-utils';

const router = express.Router();

export function setupRoutes({
  patterns,
  knapsackDistDir,
  distDir,
  publicDir,
  cacheDir,
}: {
  patterns: import('./patterns').Patterns;
  knapsackDistDir: string;
  distDir?: string;
  publicDir?: string;
  cacheDir: string;
}): typeof router {
  router.use('*', async (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept',
    );
    next();
  });

  router.use(`${apiUrlBase}`, (req, res, next) => {
    if (process.env.NODE_ENV === 'production') {
      next();
    } else {
      // faking a slight delay in local development to better reflect re-world delays
      setTimeout(next, 500);
    }
  });

  router.use(
    express.static(knapsackDistDir, {
      maxAge: '1d',
    }),
  );

  const designSystemDistDir = dirname(
    require.resolve('@knapsack/design-system/dist'),
  );
  router.use('/ks-design-system', express.static(designSystemDistDir));

  if (distDir) {
    router.use(
      express.static(distDir, {
        maxAge: '1d',
      }),
    );
  }

  if (cacheDir) {
    router.use(
      express.static(cacheDir, {
        maxAge: '1d',
      }),
    );
  }

  if (publicDir) {
    router.use(express.static(publicDir));
  }

  // This page is mainly so IE can get a list of links to view the individual templates outside of the system
  router.route('/demo-urls').get((req, res) => {
    const patternDemos = patterns.getPatterns().map(pattern => {
      return {
        id: pattern.id,
        title: pattern.title,
        templates: pattern.templates.map(template => {
          return {
            id: template.id,
            title: template.title,
            demoUrls: [
              createDemoUrl({
                patternId: pattern.id,
                templateId: template.id,
                wrapHtml: true,
                isInIframe: false,
              }),
            ],
          };
        }),
      };
    });

    /* eslint-disable prettier/prettier */
    // disabling prettier so it's possible to keep indenting semi-similar to how it'd be done with templates, please try and keep it tidy and consistent!
    res.send(`
<ul>
${patternDemos
  .map(
    patternDemo => `
  <li>
    Pattern: ${patternDemo.title}
    <ul>
      ${patternDemo.templates
        .map(
          template => `
        <li>
          Template: ${template.title}
          <br>
            ${template.demoUrls
              .map(
                (demoUrl, i) => `
              <a href="${demoUrl}" target="_blank">Demo Data ${i + 1}</a>
            `,
              )
              .join(' - ')}
        </li>
      `,
        )
        .join('\n')}
    </ul>
  </li>
`,
  )
  .join('\n')}
</ul>
    `);
    /* eslint-enable prettier/prettier */
  });

  // Since this is a Single Page App, we will send all html requests to the `index.html` file in the dist
  router.use('*', (req, res, next) => {
    const { accept = '' } = req.headers;
    const accepted = accept.split(',');
    // this is for serving up a Netlify CMS folder if present
    if (!req.baseUrl.startsWith('/admin') && accepted.includes('text/html')) {
      res.sendFile(join(knapsackDistDir, 'index.html'));
    } else {
      next();
    }
  });

  return router;
}
