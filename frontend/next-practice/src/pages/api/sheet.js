// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

// export default function handler(req, res) {
//   res.status(200).json({ name: 'John Doe' })
// }

const getSheets = async (data) => {
  const response = await fetch("http://localhost:3000/sheets", {
    method: "GET",
  });
  return response;
};

const getSheet = async (id) => {
  const response = await fetch(`http://localhost:3000/sheet/${id}`, {
    method: "GET",
  });
  return response;
};

const createSheet = async (data) => {
  const response = await fetch("http://localhost:3000/sheet", {
    method: "POST",
    mode: "cors",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  return response;
};

const updateSheet = async (data, sheetId) => {
  const response = await fetch(`http://localhost:3000/sheet/${sheetId}`, {
    method: "POST",
    mode: "cors",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  return response;
};

const deleteSheet = async (id) => {
  const response = await fetch(`http://localhost:3000/sheet/${id}`, {
    method: "DELETE"
  });

  return response;
};

export {
  createSheet,
  updateSheet,
  getSheets,
  getSheet,
  deleteSheet
}
