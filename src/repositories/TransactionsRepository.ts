import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    let income = 0;
    let outcome = 0;

    const transactions = await this.find();

    const total = transactions.reduce((acumulator, currentValue) => {
      if (currentValue.type === 'income') {
        income += currentValue.value;
        return acumulator + currentValue.value;
      }
      outcome += currentValue.value;
      return acumulator - currentValue.value;
    }, 0);

    return {
      income,
      outcome,
      total,
    };
  }
}

export default TransactionsRepository;
