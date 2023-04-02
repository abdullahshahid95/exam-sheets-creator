import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { createSheet, getSheet, updateSheet } from "../api/sheet";

function Home() {
  const router = useRouter();
  const [disablePublishButton, setDisablePublishButton] = useState(true);
  const [disableSaveButton, setDisableSaveButton] = useState(false);
  const [disableField, setDisableField] = useState(false);
  const [formFields, setFormFields] = useState({
    title: { value: "", error: "" },
    questions: [
      {
        text: { value: "", error: "" },
        type: "multiplechoice",
        choices: {
          A: { choice: "", error: "", answer: true },
          B: { choice: "", error: "", answer: false },
          C: { choice: "", error: "", answer: false },
          D: { choice: "", error: "", answer: false }
        },
        answer: "incorrect"
      }
    ]
  });

  useEffect(() => {
    if (router.isReady && router.query["id"]) {
      (async function () {
        const sheetId = router.query["id"];
        const response = await getSheet(sheetId);
        if (response.status == 200) {
          const responseData = await response.json();
          if(responseData.data) {
            if(responseData.data.status == "published") {
              setDisableField(true);
            }
            const sanitized = sanitizeResponse(responseData);
            setFormFields(sanitized);
          }
          else {
            router.replace('/sheet');
          }
        } else {
          console.log(response);
        }
      })();
    }
  }, [router.isReady]);

  useEffect(() => {
    isFormValid();
  }, [formFields]);

  function sanitizeResponse(response) {
    let fields = {
      title: { value: response.data.title, error: "" },
      questions: response.data.questions
    };

    fields.questions.map((q) => {
      q.text = { value: q.text, error: "" };

      if (q.type == "multiplechoice") {
        Object.keys(q.choices).forEach((c) => {
          q.choices[c] = {
            choice: q.choices[c].choice,
            answer: q.choices[c].answer,
            error: ""
          };
        });

        q["answer"] = "incorrect";
      } else {
        q["choices"] = {
          A: { choice: "", error: "", answer: true },
          B: { choice: "", error: "", answer: false },
          C: { choice: "", error: "", answer: false },
          D: { choice: "", error: "", answer: false }
        };
      }
      return q;
    });

    return fields;
  }

  const onTitleChange = (e) => {
    let clone = { ...formFields };
    if (!e.target.value || !e.target.value.length) {
      clone.title.error = "Please enter Title.";
    } else {
      clone.title.error = "";
    }

    clone.title.value = e.target.value;
    setFormFields({
      ...clone
    });
  };

  const onQuestionTypeChange = (e, index) => {
    let clone = { ...formFields };
    clone.questions[index].type = e.target.value;
    setFormFields({ ...clone });
  };

  const onQuestionChange = (e, index) => {
    let clone = { ...formFields };
    if (!e.target.value || !e.target.value.length) {
      clone.questions[index].text.error = "Please enter Question.";
    } else {
      clone.questions[index].text.error = "";
    }
    clone.questions[index].text.value = e.target.value;
    setFormFields({ ...clone });
  };

  const onMutipleTypeChoiceChange = (e, index, answer) => {
    let clone = { ...formFields };
    if (!e.target.value || !e.target.value.length) {
      clone.questions[index].choices[answer].error = "Please enter Choice.";
    } else {
      clone.questions[index].choices[answer].error = "";
    }
    clone.questions[index].choices[answer].choice = e.target.value;
    setFormFields({ ...clone });
  };

  const onMutipleTypeAnswerChange = (e, index, answer) => {
    let clone = { ...formFields };
    Object.keys(clone.questions[index].choices).map((c) => {
      if (c != answer) clone.questions[index].choices[c].answer = false;
      return c;
    });
    clone.questions[index].choices[answer].answer = true;
    setFormFields({ ...clone });
  };

  const onTrueFalseAnswerChange = (e, index) => {
    let clone = { ...formFields };
    clone.questions[index].answer = e.target.value;
    setFormFields({ ...clone });
  };

  const addQuestion = () => {
    let clone = { ...formFields };
    clone.questions.push({
      text: { value: "", error: "" },
      type: "multiplechoice",
      choices: {
        A: { choice: "", error: "", answer: true },
        B: { choice: "", error: "", answer: false },
        C: { choice: "", error: "", answer: false },
        D: { choice: "", error: "", answer: false }
      },
      answer: "incorrect"
    });
    setFormFields({
      ...clone
    });
  };

  const removeQuestion = (index) => {
    let clone = { ...formFields };
    clone.questions.splice(index, 1);
    setFormFields({ ...clone });
  };

  const isFormValid = () => {
    let valid =
      formFields.title.value.length > 0 && formFields.questions.length > 4;

    if (valid) {
      for (const item of formFields.questions) {
        console.log("\n\nitem, ", item);
        valid = item.text.value.length > 0;
        if (!valid) {
          break;
        }

        if (item.type == "multiplechoice") {
          valid =
            item.choices.A.choice.length > 0 &&
            item.choices.B.choice.length > 0 &&
            item.choices.C.choice.length > 0 &&
            item.choices.D.choice.length > 0;
        }

        if (!valid) {
          break;
        }
      }
    }

    setDisablePublishButton(!valid);
  };

  const sanitizeFormFields = () => {
    let clone = { ...formFields };
    clone.title = clone.title.value;
    clone.questions.map((q) => {
      q.text = q.text.value;
      if (q.type == "multiplechoice") {
        Object.keys(q.choices).forEach((c) => {
          q.choices[c] = {
            choice: q.choices[c].choice,
            answer: q.choices[c].answer
          };
        });

        delete q.answer;
      } else {
        delete q.choices;
      }
      return q;
    });

    return clone;
  };

  const onFormSubmit = async (e, status) => {
    setDisableSaveButton(true);
    let sanitized = sanitizeFormFields();

    if(status == "published") {
      sanitized = {...sanitized, status: "published"};
    }

    let response;
    if(router.query["id"]) {
      response = await updateSheet(sanitized, router.query["id"]);
    }
    else {
      response = await createSheet(sanitized);
    }

    if (response.status == 200) {
      router.replace('/');
    } else {
      console.log(response);
    }
  };

  return (
    <div className="row">
      <div className="col-12">
        <form>
          <fieldset disabled={disableField}>
            <div className="form-group">
              <h3>General Information</h3>
              <div className="form-group">
                <label htmlFor="title">Title:</label>
                <input
                  type="text"
                  className="form-control"
                  id="title"
                  value={formFields.title.value}
                  onChange={onTitleChange}
                />
                {formFields.title.error && (
                  <p className="text-danger"> {formFields.title.error} </p>
                )}
              </div>
            </div>
            <hr />
            <div className="row">
              <div className="col-12">
                <p className="no-spacing float-right">Min Questions: 5</p>
              </div>
            </div>
            {formFields.questions.map((question, index) => {
              return (
                <div key={index} className="question-box mt-2">
                  <p className="no-spacing question-number">
                    <u>{index + 1}</u>
                  </p>
                  <div className="form-group">
                    <label htmlFor="questionType">Question Type:</label>
                    <button
                      type="button"
                      onClick={() => removeQuestion(index)}
                      className="btn btn-danger float-right"
                      disabled={formFields.questions.length < 2}
                      title="Remove Entry"
                    >
                      X
                    </button>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name={`questiontype${index}`}
                        id={`multiplechoice${index}`}
                        value="multiplechoice"
                        checked={question.type == "multiplechoice"}
                        onChange={(e) => onQuestionTypeChange(e, index)}
                      />
                      <label
                        className="form-check-label"
                        htmlFor={`multiplechoice${index}`}
                      >
                        Multiple Choice
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name={`questiontype${index}`}
                        id={`truefalse${index}`}
                        value="truefalse"
                        checked={question.type == "truefalse"}
                        onChange={(e) => onQuestionTypeChange(e, index)}
                      />
                      <label
                        className="form-check-label"
                        htmlFor={`truefalse${index}`}
                      >
                        {" "}
                        True/False{" "}
                      </label>
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="question">Question:</label>
                    <input
                      type="text"
                      className="form-control"
                      id={`question${index}`}
                      value={question.text.value}
                      onChange={(e) => onQuestionChange(e, index)}
                    />
                    {question.text.error && (
                      <p className="text-danger"> {question.text.error} </p>
                    )}
                  </div>
                  {question.type == "multiplechoice" && (
                    <div id={`multipleChoiceoptions${index}`}>
                      <div className="form-group">
                        <div className="row">
                          <div className="col-3">
                            <label
                              className="form-check-label px-1"
                              htmlFor={`radio-a${index}`}
                            >
                              A
                            </label>
                            <input
                              className="form-check-input"
                              type="radio"
                              name={`option-radio${index}`}
                              id={`radio-a${index}`}
                              checked={question.choices?.A.answer}
                              onChange={(e) =>
                                onMutipleTypeAnswerChange(e, index, "A")
                              }
                            />
                            <input
                              type="text"
                              className="form-control"
                              id={`option-a${index}`}
                              value={question.choices.A.choice}
                              onChange={(e) =>
                                onMutipleTypeChoiceChange(e, index, "A")
                              }
                            />
                            {question.choices.A.error && (
                              <p className="text-danger">
                                {" "}
                                {question.choices.A.error}{" "}
                              </p>
                            )}
                          </div>
                          <div className="col-3">
                            <label
                              className="form-check-label px-1"
                              htmlFor={`radio-b${index}`}
                            >
                              B
                            </label>
                            <input
                              className="form-check-input"
                              type="radio"
                              name={`option-radio${index}`}
                              id={`radio-b${index}`}
                              checked={question.choices?.B.answer}
                              onChange={(e) =>
                                onMutipleTypeAnswerChange(e, index, "B")
                              }
                            />
                            <input
                              type="text"
                              className="form-control"
                              id={`option-b${index}`}
                              value={question.choices.B.choice}
                              onChange={(e) =>
                                onMutipleTypeChoiceChange(e, index, "B")
                              }
                            />
                            {question.choices.B.error && (
                              <p className="text-danger">
                                {" "}
                                {question.choices.B.error}{" "}
                              </p>
                            )}
                          </div>
                          <div className="col-3">
                            <label
                              className="form-check-label px-1"
                              htmlFor={`radio-c${index}`}
                            >
                              C
                            </label>
                            <input
                              className="form-check-input"
                              type="radio"
                              name={`option-radio${index}`}
                              id={`radio-c${index}`}
                              checked={question.choices?.C.answer}
                              onChange={(e) =>
                                onMutipleTypeAnswerChange(e, index, "C")
                              }
                            />
                            <input
                              type="text"
                              className="form-control"
                              id={`option-c${index}`}
                              value={question.choices.C.choice}
                              onChange={(e) =>
                                onMutipleTypeChoiceChange(e, index, "C")
                              }
                            />
                            {question.choices.C.error && (
                              <p className="text-danger">
                                {" "}
                                {question.choices.C.error}{" "}
                              </p>
                            )}
                          </div>
                          <div className="col-3">
                            <label
                              className="form-check-label px-1"
                              htmlFor={`radio-d${index}`}
                            >
                              D
                            </label>
                            <input
                              className="form-check-input"
                              type="radio"
                              name={`option-radio${index}`}
                              id={`radio-d${index}`}
                              checked={question.choices?.D.answer}
                              onChange={(e) =>
                                onMutipleTypeAnswerChange(e, index, "D")
                              }
                            />
                            <input
                              type="text"
                              className="form-control"
                              id={`option-d${index}`}
                              value={question.choices.D.choice}
                              onChange={(e) =>
                                onMutipleTypeChoiceChange(e, index, "D")
                              }
                            />
                            {question.choices.D.error && (
                              <p className="text-danger">
                                {" "}
                                {question.choices.D.error}{" "}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  {question.type == "truefalse" && (
                    <div id={`truefalseoptions${index}`}>
                      <div className="form-group">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="radio"
                            name={`true-false-answer${index}`}
                            id={`true${index}`}
                            checked={question.answer == "correct"}
                            value="correct"
                            onChange={(e) => onTrueFalseAnswerChange(e, index)}
                          />
                          <label
                            className="form-check-label"
                            htmlFor={`true${index}`}
                          >
                            {" "}
                            True{" "}
                          </label>
                        </div>
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="radio"
                            name={`true-false-answer${index}`}
                            id={`false${index}`}
                            checked={question.answer == "incorrect"}
                            value="incorrect"
                            onChange={(e) => onTrueFalseAnswerChange(e, index)}
                          />
                          <label
                            className="form-check-label"
                            htmlFor={`false${index}`}
                          >
                            {" "}
                            False{" "}
                          </label>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            <div className="row mt-2">
              <div className="col-6">
                <button
                  type="button"
                  onClick={onFormSubmit}
                  className="btn btn-primary"
                  disabled={disableSaveButton}
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={(e) => onFormSubmit(e, "published")}
                  className="btn btn-primary mx-2"
                  disabled={disablePublishButton}
                >
                  Publish
                </button>
              </div>
              <div className="col-6 d-flex">
                <button
                  type="button"
                  onClick={addQuestion}
                  className="btn btn-primary margin-left-auto"
                >
                  Add Question
                </button>
              </div>
            </div>
          </fieldset>
        </form>
      </div>
    </div>
  );
}

export default Home;
