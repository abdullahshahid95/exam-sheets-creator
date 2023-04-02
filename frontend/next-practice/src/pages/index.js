import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { getSheets, deleteSheet } from "./api/sheet";

function Home() {
  const router = useRouter();
  const [sheets, setSheets] = useState([]);
  useEffect(() => {
    getAllSheets();
  }, []);

  const getAllSheets = async () => {
    const response = await getSheets();
    if(response.status == 200) {
      setSheets((await response.json()).data);
    }
    else {
      console.log(response);
    }
  };

  const deleteSheetById = async (id, index) => {
    const confirmResponse = confirm("Delete this sheet?");
    if(confirmResponse) {
      const response = await deleteSheet(id);
      if(response.status == 200) {
        let clone = [...sheets];
        clone.splice(index, 1);
        setSheets([...clone]);
      }
      else {
        console.log(response);
      }
    }
  };

  const openSheet = async (id) => {
    router.replace(`/sheet/${id}`);
  }

  return (
    <div className="row">
      <div className="col-12">
        <div className="row">
          <div className="col-6">
            <h2>Your Exam Sheets</h2>
          </div>
          <div className="col-6">
            <Link className="btn btn-primary float-right" href="/sheet">Create Exam Sheet</Link>
          </div>
        </div>
        <table className="table table-bordered table-hover">
          <thead>
            <tr>
              <th>Title</th>
              <th>No. of Questions</th>
              <th>Status</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {sheets.map((sheet, index) => (
              <tr key={index}>
                <td className="cursor-finger" title="Click to edit or view" onClick={() => openSheet(sheet._id)}>{sheet.title}</td>
                <td>{sheet.no_of_questions}</td>
                <td>{`${sheet.status[0].toUpperCase()}${sheet.status.slice(1)}`}</td>
                <td>
                  <button
                    onClick={() => deleteSheetById(sheet._id, index)}
                    className="btn btn-danger"
                    title="Delete Sheet"
                  >
                    X
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Home;
