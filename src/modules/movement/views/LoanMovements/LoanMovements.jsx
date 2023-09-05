import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  InlineNotification,
  Pagination,
  MultiSelect,
  Button,
  DatePicker,
  DatePickerInput,
  NumberInput,
  IconButton,
} from "@carbon/react";
import { View } from "@carbon/icons-react";

import environment from "../../../../environment";

import movementService from "../../movement.service";

import { delay, getMessageFromAxiosError } from "../../../../utils";
import { formatCurrency } from "../../../../utils/format-currency";
import { formatDate } from "../../../../utils/format-date";

import BackButton from "../../../../components/BackButton";
import AppDataTable from "../../../../components/AppDataTable";

import { GlobalContext } from "../../../../App.jsx";

const headers = [
  {
    key: "type",
    header: "Type",
  },
  {
    key: "dueDate",
    header: "Due Date",
  },
  {
    key: "movementDate",
    header: "M. Date",
  },
  {
    key: "amount",
    header: "Amount",
  },
  {
    key: "interest",
    header: "Interest",
  },
  {
    key: "principal",
    header: "Principal",
  },
  {
    key: "balance",
    header: "Balance",
  },
  {
    key: "paid",
    header: "Paid",
  },
  {
    key: "processed",
    header: "Processed",
  },
  {
    key: "proofURL",
    header: "Proof",
  },
  {
    key: "createdAt",
    header: "Created At",
  },
];

const movementTypeOptions = [
  {
    text: "Loan installment",
    value: environment.LOAN_INSTALLMENT_MOVEMENT_TYPE,
  },
  {
    text: "Overdue interest",
    value: environment.OVERDUE_INTEREST_MOVEMENT_TYPE,
  },
  { text: "Payment", value: environment.PAYMENT_MOVEMENT_TYPE },
  {
    text: "Payment term reduction",
    value: environment.PAYMENT_TERM_REDUCTION_MOVEMENT_TYPE,
  },
  {
    text: "Payment installment amount reduction",
    value: environment.PAYMENT_INSTALLMENT_AMOUNT_REDUCTION_MOVEMENT_TYPE,
  },
];

const LoanMovements = () => {
  const [movements, setMovements] = useState([]);
  const [movementsLoading, setMovementsLoading] = useState(true);
  const [movementsError, setMovementsError] = useState("");

  const [totalRows, setTotalRows] = useState(0);
  const [currentPageSize, setCurrentPageSize] = useState(10);

  // eslint-disable-next-line no-unused-vars
  const [q, setQ] = useState(undefined);
  const [movementTypes, setMovementTypes] = useState(undefined);
  const [startDate, setStartDate] = useState(undefined);
  const [endDate, setEndDate] = useState(undefined);
  const [startAmount, setStartAmount] = useState(undefined);
  const [endAmount, setEndAmount] = useState(undefined);

  const ctx = useContext(GlobalContext);
  const navigate = useNavigate();

  const { user } = ctx;

  const { uid } = useParams();

  const getRowItems = (rows) =>
    rows.map((row) => {
      return {
        ...row,
        amount: formatCurrency(row.amount),
        interest: row.interest ? formatCurrency(row.interest) : "-",
        principal: row.principal ? formatCurrency(row.principal) : "-",
        balance: row.balance ? formatCurrency(row.balance) : "-",
        dueDate: row.dueDate ? formatDate(new Date(row.dueDate), "UTC") : "-",
        movementDate: row.movementDate
          ? formatDate(new Date(row.movementDate), "UTC")
          : "-",
        paid: row.paid ? row.paid : "-",
        processed: row.processed ? row.processed : "-",
        proofURL: row.proofURL ? (
          <IconButton
            kind="ghost"
            size="sm"
            label="Ver"
            iconDescription="Ver"
            renderIcon={View}
            onClick={() => {
              window.open(row.proofURL, "_blank");
            }}
          />
        ) : (
          "-"
        ),
        createdAt: formatDate(new Date(row.createdAt), "UTC"),
        updatedAt: formatDate(new Date(row.updatedAt), "UTC"),
      };
    });

  const fetchMovements = async ({
    loanUid = undefined,
    types = undefined,
    startDate = undefined,
    endDate = undefined,
    startAmount = undefined,
    endAmount = undefined,
    take = undefined,
    skip = undefined,
  }) => {
    setMovementsLoading(true);

    try {
      const [{ count, movements }] = await Promise.all([
        movementService.getLoanMovements({
          loanUid,
          types,
          startDate,
          endDate,
          startAmount,
          endAmount,
          take,
          skip,
        }),
        delay(),
      ]);

      setTotalRows(count);
      setMovements(getRowItems(movements));
    } catch (error) {
      setMovementsError(getMessageFromAxiosError(error));
    }

    setMovementsLoading(false);
  };

  useEffect(() => {
    if (!user) {
      return navigate("/");
    }
    fetchMovements({ loanUid: uid, take: currentPageSize, skip: 0 });
  }, [navigate, user, uid]);

  const handleMultiSelectOnChange = ({ selectedItems }) => {
    const selectedItemsValue = selectedItems
      .map((item) => item.value)
      .join(",");
    setMovementTypes(selectedItemsValue);
  };

  const handleDatePickerOnChange = (dates = []) => {
    const [startDate, endDate] = dates;

    if (startDate && endDate) {
      setStartDate(startDate.toISOString().split("T")[0]);
      setEndDate(endDate.toISOString().split("T")[0]);
    } else {
      setStartDate(undefined);
      setEndDate(undefined);
    }
  };

  return (
    <div className="cds--grid">
      <div className="cds--row">
        <BackButton />
        <div className="cds--col-sm-4">
          <h3 className="screen__heading">Loan Movements</h3>
          {movementsError && (
            <div
              style={{ marginBottom: "1rem" }}
              className="screen__notification_container"
            >
              <InlineNotification
                kind="error"
                subtitle={movementsError}
                title="Uups!"
                onClose={() => setMovementsError("")}
              />
            </div>
          )}
          {!movementsError && movements && (
            <>
              <div className="cds--row">
                <div className="cds--col-lg-4 cds--col-sm-4">
                  <MultiSelect
                    label="Selected"
                    id="movement-types-select-id"
                    titleText="Movement types"
                    helperText=""
                    items={movementTypeOptions}
                    itemToString={(item) => (item ? item.text : "")}
                    onChange={handleMultiSelectOnChange}
                    selectionFeedback="top-after-reopen"
                    size="sm"
                  />
                </div>
                <div className="cds--col-lg-4 cds--col-sm-4">
                  <DatePicker
                    datePickerType="range"
                    // eslint-disable-next-line no-console
                    onChange={handleDatePickerOnChange}
                  >
                    <DatePickerInput
                      id="date-picker-input-id-start"
                      placeholder="mm/dd/yyyy"
                      labelText="Start date"
                      size="sm"
                    />
                    <DatePickerInput
                      id="date-picker-input-id-finish"
                      placeholder="mm/dd/yyyy"
                      labelText="End date"
                      size="sm"
                    />
                  </DatePicker>
                </div>
                <div className="cds--col-lg-3 cds--col-sm-2">
                  <NumberInput
                    id="carbon-number"
                    min={0}
                    max={100000000}
                    label="Start amount"
                    helperText=""
                    invalidText=""
                    size="sm"
                    onChange={(e) => setStartAmount(e.target.value)}
                  />
                </div>
                <div className="cds--col-lg-3 cds--col-sm-2">
                  <NumberInput
                    id="carbon-number"
                    min={0}
                    max={100000000}
                    label="End amount"
                    helperText=""
                    invalidText=""
                    size="sm"
                    onChange={(e) => setEndAmount(e.target.value)}
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-end",
                  }}
                  className="cds--col-lg-2 cds--col-sm-4"
                >
                  <Button
                    kind="primary"
                    size="sm"
                    label=""
                    iconDescription=""
                    onClick={() =>
                      fetchMovements({
                        loanUid: uid,
                        types: movementTypes,
                        startDate,
                        endDate,
                        startAmount,
                        endAmount,
                        take: currentPageSize,
                      })
                    }
                    disabled={movementsLoading}
                    style={{
                      width: "inherit",
                      marginBottom: "0.1rem",
                      minWidth: "100%",
                    }}
                  >
                    Search
                  </Button>
                </div>
              </div>
              <AppDataTable
                title={"Movements"}
                description={"List of movements"}
                headers={headers}
                rows={movements}
              />
              <Pagination
                totalItems={totalRows}
                backwardText="Previous page"
                forwardText="Next page"
                pageSize={currentPageSize}
                pageSizes={[5, 10, 15, 25]}
                itemsPerPageText="Items per page"
                onChange={({ page, pageSize }) => {
                  if (pageSize !== currentPageSize) {
                    setCurrentPageSize(pageSize);
                  }

                  fetchMovements({
                    loanUid: uid,
                    q,
                    take: pageSize,
                    skip: pageSize * (page - 1),
                  });
                }}
                size="sm"
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoanMovements;
