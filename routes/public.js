import express from "express";
import bcrypt from "bcrypt";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = express.Router();

//Cadastro
router.post("/cadastro", async (req, res) => {
  try {
    const user = req.body;

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(user.password, salt);

    const userDB = await prisma.User.create({
      data: {
        email: user.email,
        name: user.name,
        password: hashPassword,
      },
    });
    res.status(201).json(userDB);
  } catch (err) {
    res.status(500).json({ message: "Deu erro" });
  }
});

//Login

router.post("/login", async (req, res) => {
  try {
    const userInfo = req.body;

    //Busca o usuário no banco de dados
    const user = await prisma.user.findUnique({
      where: { email: userInfo.email },
    })

    // Verifica se o usuário existe no banco
    if(!user){
      return res.status(404).json({message: "Usuario não encontrado"})
    }

    // Compara a senha do banco com oque o usuário  digitou
    const isMatch = await bcrypt.compare(userInfo.password, user.password)

    if(!isMatch){
      return res.status(400).json({message: "senha invalida"})
    }

    // Gerar o token JWT

    res.status(200).json(user)
  } catch (err) {
    res.status(500).json({ message: "Deu erro, tente novamente..." });
  }
});

export default router;
