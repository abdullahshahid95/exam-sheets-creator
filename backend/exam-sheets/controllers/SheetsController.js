const { default: mongoose } = require("mongoose");
const { validate } = require("../helpers/validate-sheet");
const { sheetsModel } = require("../models/Sheet");
const { teachersModel } = require("../models/Teacher");
const ObjectId = mongoose.Types.ObjectId;

const getSheets = async (request, reply) => {
  const teachers = await teachersModel.find({});
  let teacher;
  if (teachers.length < 1) {
    teacher = await teachersModel.create({ name: "Sarim Ali" });
  } else {
    teacher = teachers[0];
  }
  const sheets = await sheetsModel
    .aggregate([
      { $match: { teacher_id: ObjectId(teacher.id) } },
      {
        $project: {
          _id: 1,
          title: 1,
          status: 1,
          created_at: 1,
          no_of_questions: { $size: "$questions" }
        }
      }
    ])
    .sort({ _id: -1 });

  return reply.send({ message: "Exam sheets retrieved.", data: sheets });
};

const getSheet = async (request, reply) => {
  const { sheetId } = request.params;

  const sheet = await sheetsModel.findById(sheetId);

  return reply.send({ message: "Selecet exam sheet retrieved.", data: sheet });
};

const createSheet = async (request, reply) => {
  const formFields = request.body;

  const teachers = await teachersModel.find({});
  let teacher;
  if (teachers.length < 1) {
    teacher = await teachersModel.create({ name: "Sarim Ali" });
  } else {
    teacher = teachers[0];
  }

  let data = {
    teacher_id: teacher.id,
    title: formFields?.title,
    questions: formFields?.questions,
    ...(isuPublished(formFields, reply))
  };

  await sheetsModel.create(data);
  return reply.send({ message: "Exam sheet saved." });
};

const updateSheet = async (request, reply) => {
  try {
    const formFields = request.body;
    const { sheetId } = request.params;

    let data = {
      title: formFields?.title,
      questions: formFields?.questions,
      ...(isuPublished(formFields, reply))
    };

    await sheetsModel.findByIdAndUpdate(sheetId, data);
  
    return reply.send({ message: "Exam sheet updated." });
  } catch (err) {
    console.log("error in update, ", err);
    return reply.code(500).send({ message: err.message });
  }
};

const publishSheet = async (request, reply) => {
  const formFields = request.body;
  const teachers = await teachersModel.find({});
  let teacher;
  if (teachers.length < 1) {
    teacher = await teachersModel.create({ name: "Sarim Ali" });
  } else {
    teacher = teachers[0];
  }
  await sheetsModel.create({
    teacher_id: teacher.id,
    title: formFields?.title,
    questions: formFields?.questions
  });
  return reply.send({ message: "Exam sheet saved." });
};

const deleteSheet = async (request, reply) => {
  try {
    const { sheetId } = request.params;

    await sheetsModel.deleteOne({ _id: sheetId });
    return reply.send({ message: "Exam sheet deleted." });
  } catch (err) {
    console.log("error in deletion, ", err);
    return reply.code(500).send({ message: err.message });
  }
};

function isuPublished(formFields, reply) {
  if(formFields?.status == "published") {
    const error = validate(formFields);
    if(error) {
      return reply.send(error.message);
    }
    return {status: formFields?.status};
  }
  return {};
}

module.exports = {
  createSheet,
  updateSheet,
  getSheets,
  getSheet,
  deleteSheet,
  publishSheet
};
