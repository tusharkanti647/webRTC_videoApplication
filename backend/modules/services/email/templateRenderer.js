import fs from 'fs/promises';
import path from 'path';

const templateCache = new Map();

export const renderTemplate = async (templateName, variables) => {
  let template = templateCache.get(templateName);

  if (!template) {
    const templatePath = path.join(
      process.cwd(),
      'modules',
      'services',
      'email',
      'templates',
      `${templateName}.html`,
    );

    template = await fs.readFile(templatePath, 'utf-8');

    templateCache.set(templateName, template);
  }

  let html = template;

  Object.entries(variables).forEach(([key, value]) => {
    html = html.replaceAll(`{{${key}}}`, value ?? '');
  });

  return html;
};
