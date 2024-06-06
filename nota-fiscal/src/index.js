import nodemailer from 'nodemailer';
import { Kafka } from 'kafkajs';

const kafka = new Kafka({
  brokers: ['localhost:9092'],
})

const consumer = kafka.consumer({ groupId: 'notas-fiscais-2' })

const transporter = nodemailer.createTransport({
    host: 'sandbox.smtp.mailtrap.io',
    port: 2525,
    auth: {
        user: "cde7da05ccfa90",
        pass: "12478209814bd8"
    }
});

await consumer.connect();
await consumer.subscribe({ topic: 'novos-pedidos-particionado', fromBeginning: true});
await consumer.run({
  eachMessage: async ({topic, partition, message}) => {
    const pedido = JSON.parse(message.value);

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
      <estado>${pedido.cliente.endereco.uf || ""}</estado>
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


  }
});


