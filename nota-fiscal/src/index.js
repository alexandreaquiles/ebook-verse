import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: 'sandbox.smtp.mailtrap.io',
    port: 2525,
    auth: {
        user: "cde7da05ccfa90",
        pass: "12478209814bd8"
    }
});

const pedido  =  {
  "_id": "66621e9fa46d7d1ecd206f08",
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
          "cep": "69097276",
          "_id": "66621e9fa46d7d1ecd206f0a"
      },
      "_id": "66621e9fa46d7d1ecd206f09"
  },
  "itens": [
      {
          "ebookId": "66621e3ba46d7d1ecd206f04",
          "nome": "Quotes",
          "repo": "https://github.com/alexandreaquiles/quote-ebook.git",
          "preco": 79.9,
          "_id": "66621e9fa46d7d1ecd206f0b"
      }
  ],
  "__v": 0
}

const notaFiscal = `<xml>
  <loja>314276853</loja>
  <nat_operacao>LIVROS VIRTUAIS (E-BOOKS) POR DOWNLOAD; COMÉRCIO VAREJISTA DE</nat_operacao>
  <pedido>
    <items>
      ${pedido.itens.map(item =>
        `<item>
          <descricao>${item.nome}</descricao>
          <un>un</un>
          <codigo>004</codigo>
          <qtde>1</qtde>
          <vlr_unit>${item.preco}</vlr_unit>
          <tipo>P</tipo>
          <class_fiscal>4761001</class_fiscal>
        </item>`).join('')}
    </items>
  </pedido>
  <cliente>
    <nome>${pedido.cliente.nome}</nome>
    <tipoPessoa>F</tipoPessoa>
    <contribuinte>9</contribuinte>
    <cpf_cnpj>${pedido.cliente.cpf}</cpf_cnpj>
    <email>${pedido.cliente.email}</email>
    <endereco>${pedido.cliente.endereco.logradouro + ", " + pedido.cliente.endereco.numero}</endereco>
    <bairro>${pedido.cliente.endereco.bairro }</bairro>
    <cidade>${pedido.cliente.endereco.cidade || ""}</cidade>
    <estado>${pedido.cliente.endereco.estado || ""}</estado>
    <complemento>${pedido.cliente.endereco.complemento || ""}</complemento>
    <cep>${pedido.cliente.endereco.cep}</cep>
  </cliente>
</xml>`;

console.log(notaFiscal);

const destinatario = pedido.cliente.email;

const assuntoEmail = 'Sua compra na Ebook Verse';

const corpoEmail = `Obrigado pela sua compra!

Seu(s) ebook(s) já está(ão) sendo gerado(s):

${pedido.itens.map(item =>
    `- Ebook: "${item.nome}" (R$ ${item.preco.toFixed(2).replace('.', ',')})`).join('')}

Os dados da sua nota fiscal estão a seguir:

${notaFiscal}`;

const mailOptions = {
  from: 'info@ebook-verse.com',
  to: destinatario,
  subject: assuntoEmail,
  text: corpoEmail
};

transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
      return console.log(error);
  }
  console.log('Email enviado: ' + info.response);
});

