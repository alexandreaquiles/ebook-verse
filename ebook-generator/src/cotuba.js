import fs from 'fs/promises';
import path from 'path';
import { simpleGit } from 'simple-git';
import markdownit from 'markdown-it';
import Epub from 'epub-gen';
import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'sandbox.smtp.mailtrap.io',
  port: 2525,
  auth: {
      user: "cde7da05ccfa90",
      pass: "12478209814bd8"
  }
});

const argv = yargs(hideBin(process.argv))
.options({
  'd': { alias: 'dir', describe: 'Directory containing Markdown files', type: 'string', default: '.' },
  'f': { alias: 'format', describe: 'Output format (epub or pdf)', type: 'string', default: 'epub' },
  'o': { alias: 'output', describe: 'Output filename', type: 'string', default: null },
  'v': { alias: 'verbose', describe: 'Enable verbose mode', type: 'boolean', default: false }
})
.help()
.alias('help', 'h')
.argv;

let inputDirectory;
let outputFormat;
let outputFilename;
let verboseMode;

if ('.' != argv.d) {
  inputDirectory = argv.d;
  outputFormat = argv.f;
  outputFilename = argv.o || `book.${outputFormat}`;
  verboseMode = argv.v;

  geraEbook();
} else {
  const git = simpleGit();

  const pedido  =  {
      "_id": "6661dce431dbe482678727da",
      "cliente": {
          "nome": "Luís Giovanni Hugo Ribeiro",
          "cpf": "28265400500",
          "email": "luis_giovanni_ribeiro@terapeutaholistica.com.br",
          "telefone": "92982055415",
          "endereco": {
              "logradouro": "Rua Albânia",
              "numero": "432",
              "complemento": "",
              "bairro": "Nova Cidade",
              "cidade": "Manaus",
              "uf": "AM",
              "cep": "69097276"
          }
      },
      "itens": [
          {
              "_id": "6661dc5b31dbe482678727ce",
              "nome": "Quotes",
              "repo": "https://github.com/alexandreaquiles/quote-ebook.git",
              "__v": 0,
              "preco": 79.90
          }
      ],
      "__v": 0
      }
  
  pedido.itens.forEach(async (ebook, i) => { 
      const repoUrl = ebook.repo;
      const ebookName = ebook.nome.toLowerCase().replace(/\s+/, '');
      const localPath = path.resolve(`./${pedido._id}-repo-${ebookName}-${Date.now()}`);
      await git.clone(repoUrl, localPath)
      console.log(`Repositório clonado para ${localPath}`);

      inputDirectory = localPath;
      outputFormat = 'epub';
      outputFilename = `${ebookName}-${pedido._id}-${Date.now()}.${outputFormat}`;
      verboseMode = true;
    
      geraEbook();

      const destinatario = pedido.cliente.email;

      const assuntoEmail = 'Seu ebook da Ebook Verse';

      const corpoEmail = `Seu ebook ${ebook.nome} está em anexo. Boa leitura!`

      const mailOptions = {
        from: 'info@ebook-verse.com',
        to: destinatario,
        subject: assuntoEmail,
        text: corpoEmail,
        attachments: [
          {
              filename: outputFilename, // File name
              path: `./${outputFilename}` // Path to the file
          }
      ]
      };
      
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Email enviado: ' + info.response);
      });
      
  });

}

async function geraEbook() {

  try {

  const files = await fs.readdir(inputDirectory, { withFileTypes: true });
  const markdownFiles = files
    .filter(dirent => dirent.isFile() && dirent.name.endsWith('.md'))
    .map(dirent => dirent.name);
  markdownFiles.sort();

  const md = markdownit();

  const chapters = [];
  for (const filename of markdownFiles) {
    const filePath = path.join(inputDirectory, filename);
    const fileContent = await fs.readFile(filePath, 'utf-8');

    let chapterTitle = filename.replace('.md', '');
    const tokens = md.parse(fileContent, {});
    let extractTitleFromInline = false;
    for (const token of tokens) {
      if (extractTitleFromInline && token.type === 'inline') {
        chapterTitle = token.content;
        break;
      }
      if (token.type === 'heading_open' && token.tag === 'h1') {
        extractTitleFromInline = true;
      }
    }
    const chapterHtml = md.render(fileContent);

    chapters.push({ title: chapterTitle, html: chapterHtml });
  }

  if (outputFormat === 'epub') {
    const options = {
      title: 'Book',
      content: chapters.map(chapter => ({
        title: chapter.title,
        data: chapter.html
      })),
      appendChapterTitles: false,
      verbose: false
    };

    await new Epub(options, outputFilename).promise;
  } else {
    throw `Formato inválido: ${outputFormat}`;
  }

  console.log(`Ebook gerado ${outputFilename}`)
  } catch (err) {
  console.error("Erro ao gerar ebook:", err);
  if (verboseMode) {
    console.error(err.stack);
  }
  }
}
