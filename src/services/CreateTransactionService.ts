import { getCustomRepository, getRepository } from 'typeorm';

import AppError from '../errors/AppError';
import TransactionsRepository from '../repositories/TransactionsRepository';
import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface CreateTransaction {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: CreateTransaction): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const categoriesRepository = getRepository(Category);

    let category_id = '';

    const categoryExists = await categoriesRepository.findOne({
      where: {
        title: category,
      },
    });

    if (categoryExists) {
      category_id = categoryExists.id;
    } else {
      const newCategory = await categoriesRepository.create({
        title: category,
      });

      await categoriesRepository.save(newCategory);

      category_id = newCategory.id;
    }

    const balance = await transactionsRepository.getBalance();

    if (type === 'outcome' && balance.total < value) {
      throw new AppError('You do not have enough money');
    }

    const transaction = await transactionsRepository.create({
      title,
      value,
      type,
      category_id,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
