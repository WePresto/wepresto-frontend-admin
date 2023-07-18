import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  InlineNotification,
  Form,
  TextInput,
  Button,
  ComboBox,
  FileUploader,
} from "@carbon/react";

import loanParticipationService from "../../loan-participation.service";
import lenderService from "../../../lender/lender.service";
import loanService from "../../../loan/loan.service";

import { getMessageFromAxiosError } from "../../../../utils";
import { formatCurrency } from "../../../../utils/format-currency";

import BackButton from "../../../../components/BackButton";

import { GlobalContext } from "../../../../App.jsx";

const CreateLenderLoanParticipation = () => {
  const [amount, setAmount] = useState(undefined);
  const [invalidAmount, setInvalidAmount] = useState(false);
  const [loanUid, setLoanUid] = useState(undefined);
  const [invalidLoanUid, setInvalidLoanUid] = useState(false);
  const [lender, setLender] = useState(undefined);
  const [loan, setLoan] = useState(undefined);
  const [loans, setLoans] = useState([]);
  const [file, setFile] = useState(undefined);

  const [createLoanParticipationLoading, setCreateLoanParticipationLoading] =
    useState(false);
  const [createLoanParticipationError, setCreateLoanParticipationError] =
    useState(undefined);
  const [createLoanParticipationMessage, setCreateLoanParticipationMessage] =
    useState(undefined);

  const ctx = useContext(GlobalContext);
  const navigate = useNavigate();

  const { user } = ctx;

  const { uid } = useParams();

  const fetchLender = async ({ uid }) => {
    setCreateLoanParticipationLoading(true);

    try {
      const data = await lenderService.getOne({ uid });

      setLender(data);
    } catch (error) {
      setCreateLoanParticipationError(getMessageFromAxiosError(error));
    }

    setCreateLoanParticipationLoading(false);
  };

  const fetchLoans = async () => {
    setCreateLoanParticipationLoading(true);

    try {
      const { loans } = await loanService.getLoansNeedingFunding({
        take: 100,
        skip: 0,
      });
      setLoans(loans);
    } catch (error) {
      setCreateLoanParticipationError(getMessageFromAxiosError(error));
    }
  };
  useEffect(() => {
    if (!user) {
      return navigate("/");
    }

    fetchLender({ uid });
    fetchLoans();
  }, [navigate, user, uid]);

  const handleLoanUidChange = ({ selectedItem }) => {
    setLoanUid(selectedItem?.uid);
    setLoan(selectedItem);
  };

  const handleCreateLoanParticipationSubmit = async (event) => {
    event.preventDefault();

    if (!amount || amount.trim().length === 0) {
      setInvalidAmount(true);
      return;
    }

    const parsedAmount = parseInt(amount, 10);
    if (isNaN(parsedAmount)) {
      setInvalidAmount(true);
      return;
    }
    setInvalidAmount(false);

    if (!loanUid || loanUid.trim().length === 0) {
      setInvalidLoanUid(true);
      return;
    }
    setInvalidLoanUid(false);

    try {
      const { message } = await loanParticipationService.create({
        lenderUid: uid,
        loanUid,
        amount: parsedAmount,
        file,
      });

      setCreateLoanParticipationMessage(message);

      // clean the values of the form
      document.getElementById("text-input-amount").value = "";
      setAmount(undefined);
      setLoanUid(undefined);
      setFile(undefined);
    } catch (error) {
      setCreateLoanParticipationError(getMessageFromAxiosError(error));
    }

    setCreateLoanParticipationLoading(false);
  };

  return (
    <div className="cds--grid">
      <div className="cds--row">
        <BackButton />
        <div className="cds--offset-lg-5 cds--col-lg-6 cds--col-md-8 cds--col-sm-4">
          <h3 className="screen__heading">
            Lender Loan Participation Creation
          </h3>
          <Form onSubmit={handleCreateLoanParticipationSubmit}>
            <div className="cds--row" style={{ marginBottom: "1rem" }}>
              <div className="cds--col-lg-8 cds--col-sm-4">
                <p className="screen__label">D. Number</p>
                <p>{lender?.user?.documentNumber}</p>
              </div>
              <div className="cds--col-lg-8 cds--col-sm-4">
                <p className="screen__label">Full Name</p>
                <p>{lender?.user?.fullName}</p>
              </div>
            </div>
            <hr />
            <div style={{ marginBottom: "1rem" }}>
              <TextInput
                id="text-input-amount"
                labelText="Amount"
                invalid={invalidAmount}
                invalidText="Invalid value"
                onChange={(event) => setAmount(event.target.value)}
                autoComplete="off"
              />
              <p>{formatCurrency(amount, "COP")}</p>
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <FileUploader
                labelTitle="Proof file"
                labelDescription="Max file size is 15mb. Only [.jpg, .png] files are supported."
                buttonLabel="Add file"
                buttonKind="primary"
                size="sm"
                filenameStatus="edit"
                accept={[".jpg", ".png"]}
                iconDescription="Delete file"
                name="file"
                multiple={false}
                disabled={false}
                onChange={(event) => setFile(event.target.files[0])}
                onDelete={() => setFile(undefined)}
              />
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <ComboBox
                id="loans-combobox"
                items={loans}
                onChange={handleLoanUidChange}
                downshiftProps={{
                  onStateChange: () => {
                    // eslint-disable-next-line no-console
                    console.log("the state has changed");
                  },
                }}
                itemToString={(item) => (item ? item.uid : "")}
                titleText="Loan"
                invalid={invalidLoanUid}
                invalidText="Invalid value"
              />
            </div>
            {loan && (
              <div className="cds--row" style={{ marginBottom: "1rem" }}>
                <div className="cds--col-lg-8 cds--col-sm-4">
                  <p className="screen__label">Alias</p>
                  <p>{loan.alias || "-"}</p>
                </div>
                <div className="cds--col-lg-8 cds--col-sm-4">
                  <p className="screen__label">Loan Amount</p>
                  <p>{formatCurrency(loan?.amount, "COP")}</p>
                </div>
                <div className="cds--col-lg-8 cds--col-sm-4">
                  <p className="screen__label">Funded Amount</p>
                  <p>{formatCurrency(loan?.fundedAmount, "COP")}</p>
                </div>
                <div className="cds--col-lg-8 cds--col-sm-4">
                  <p className="screen__label">Remaining Amount</p>
                  <p>{formatCurrency(loan?.remainingAmount, "COP")}</p>
                </div>
              </div>
            )}
            {createLoanParticipationError && (
              <div
                style={{ marginBottom: "1rem" }}
                className="screen__notification_container"
              >
                <InlineNotification
                  kind="error"
                  subtitle={createLoanParticipationError}
                  title="Uups!"
                  onClose={() => setCreateLoanParticipationError(undefined)}
                />
              </div>
            )}
            {createLoanParticipationMessage && (
              <div
                style={{ marginBottom: "1rem" }}
                className="screen__notification_container"
              >
                <InlineNotification
                  kind="success"
                  subtitle={createLoanParticipationMessage}
                  title="Cool!"
                  onClose={() => setCreateLoanParticipationMessage(undefined)}
                />
              </div>
            )}
            <div style={{ marginBottom: "1rem" }}>
              <Button
                className="btn-block"
                type="submit"
                size="sm"
                disabled={createLoanParticipationLoading}
              >
                Create
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default CreateLenderLoanParticipation;
