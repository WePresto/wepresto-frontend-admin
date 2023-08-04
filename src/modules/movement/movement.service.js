import axios from "axios";

import environment from "../../environment";

import { getIdTokenFromCurrentUser, addMinutes } from "../../utils";

class MovementService {
  async getLoanMovements({
    loanUid = undefined,
    types = undefined,
    startDate = undefined,
    endDate = undefined,
    startAmount = undefined,
    endAmount = undefined,
    take = undefined,
    skip = undefined 
  }) {
    const token = await getIdTokenFromCurrentUser();

    const { data } = await axios({
      url: `${environment.API_URL}movements/loan-movements`,
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        loanUid,
        types,
        startDate,
        endDate,
        startAmount: startAmount || undefined,
        endAmount: endAmount || undefined,
        take,
        skip,
      },
    });

    const { count, movements } = data;

    return {
      count,
      movements: movements.map((loan) => ({
        ...loan,
        id: "" + loan.id,
      })),
    };
  }

  async createPayment({ loanUid, amount, paymentDate, type, file }) {
    const token = await getIdTokenFromCurrentUser();

    const formData = new FormData();
    formData.append("loanUid", loanUid);
    formData.append("amount", amount);
    formData.append("paymentDate", paymentDate);
    if (type) formData.append("type", type);
    if (file) formData.append("file", file);

    const { data } = await axios({
      url: `${environment.API_URL}movements/payment`,
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      data: formData,
    });

    return {
      ...data,
      message: "Payment created successfully",
    };
  }

  async getLoanPayments({ uid, limit = undefined }) {
    const token = await getIdTokenFromCurrentUser();

    const { data } = await axios({
      url: `${environment.API_URL}movements/loan/${uid}/payments`,
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        limit: limit,
      },
    });

    return data.map((item) => {
      return {
        ...item,
        id: item.id + "",
        at: addMinutes(item.at, 5 * 60),
      };
    });
  }
}

const movementService = new MovementService();

export default movementService;
