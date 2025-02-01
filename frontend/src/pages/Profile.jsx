import { useEffect, useState } from "react";
import api from "../api";
import { MdOutlineSystemUpdateAlt } from "react-icons/md";
import { FaRegEdit, FaRegSave } from "react-icons/fa";
import Loading from "../components/Extensions/Loading";
import { useTranslation } from "react-i18next";

function Profile() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [employee, setEmployee] = useState({});
  const [employeeForm, setEmployeeForm] = useState({
    gender: [
      { value: "Male", label: "Male" },
      { value: "Female", label: "Female" },
    ],
    position: [],
  });
  const [updateUserTrigger, setUpdateUserTrigger] = useState(false);
  const [updateEmployeeTrigger, setUpdateEmployeeTrigger] = useState(false);
  const [newUpdateUser, setNewUpdateUser] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
  });
  const [newUpdateEmployee, setNewUpdateEmployee] = useState({
    phone: "",
    adress: "",
    position: "",
    gender: "",
    recruitmentDate: "",
    birthday: "",
  });

  useEffect(() => {
    const EmployeeInfos = async () => {
      setLoading(true);
      await api
        .get("/api/myprofile/")
        .then((res) => res.data)
        .then((data) => {
          setEmployee(data);
        })
        .catch((err) => alert(err))
        .finally(async () => {
          await api
            .get("api/myprofile/getpositions/")
            .then((resp) => {
              setEmployeeForm({ ...employeeForm, position: resp.data });
            })
            .catch((err) => alert(err))
            .finally(() => setLoading(false));
        });
    };

    EmployeeInfos();
  }, []);

  const formatPhoneNumber = (num) => {
    if (num.length !== 10) {
      return "Invalid phone number (must be a 10-digit number)";
    } else {
      return num
        .replace(/^(\d{2})/, "($1) ")
        .replace(/(\d{2})(\d{2})(\d{2})(\d{2})/, "$1 $2 $3 $4");
    }
  };

  const getPositionLabel = () => {
    const position = employeeForm.position.find(
      (pos) => pos.value === employee.position
    );
    return position ? position.label : "";
  };

  const handleUpdateUser = (e) => {
    setNewUpdateUser({
      ...newUpdateUser,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdateEmployee = (e) => {
    setNewUpdateEmployee({
      ...newUpdateEmployee,
      [e.target.name]: e.target.value,
    });
  };

  const sendUpdateUser = async () => {
    setLoading(true);
    const firstName = newUpdateUser.first_name;
    const firstNameFirstChar = firstName.charAt(0);
    const firstNameFirstCharCapitalized = firstNameFirstChar.toUpperCase();
    const firstNameRemainingText = firstName.slice(1).toLowerCase();
    const capitalizedFirstName =
      firstNameFirstCharCapitalized + firstNameRemainingText;
    await api
      .put(`api/updateuserinfos/${employee.user.id}/`, {
        username: newUpdateUser.username.toLowerCase(),
        email: newUpdateUser.email,
        first_name: capitalizedFirstName,
        last_name: newUpdateUser.last_name.toUpperCase(),
        password: newUpdateUser.password,
      })
      .catch((err) => alert(err))
      .finally(() => setLoading(false));
  };

  const sendUpdateEmployee = async () => {
    setLoading(true);
    const employeeForm = new FormData();
    employeeForm.append("gender", newUpdateEmployee.gender);
    employeeForm.append("phone", newUpdateEmployee.phone);
    employeeForm.append("adress", newUpdateEmployee.adress);
    employeeForm.append("position", newUpdateEmployee.position);
    employeeForm.append("recruitmentDate", newUpdateEmployee.recruitmentDate);
    employeeForm.append("birthday", newUpdateEmployee.birthday);
    await api
      .put("api/myprofile/updateemployee/", employeeForm)
      .then((resp) => resp.data)
      .then((data) => setEmployee((prev) => ({ ...prev, ...data })))
      .catch((err) => alert(err))
      .finally(() => setLoading(false));
  };

  const changeProfilePic = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setLoading(true);
      const formdata = new FormData();
      formdata.append("profile_pic", file);
      await api
        .put("api/myprofile/updateProfilePicture/", formdata, {
          headers: { "Content-Type": "multipart/form-data" },
        })
        .catch((err) => alert(err))
        .finally(() => {
          setLoading(false);
          location.reload();
        });
    }
  };

  return (
    <div className="max-w-full p-4 bg-gray-100">
      {loading && <Loading />}
      <div className="flex flex-col items-center mx-auto">
        {Object.keys(employee).length > 0 && (
          <div className="flex flex-col gap-12 w-full items-center">
            {/* Profile Picture Section */}
            <div className="group w-72 h-72 my-6 rounded-full overflow-hidden bg-blue-200 relative shadow-lg">
              <div className="w-full h-full absolute bg-black/70 flex justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <label htmlFor="profilePic" className="text-5xl text-white cursor-pointer">
                  <MdOutlineSystemUpdateAlt />
                </label>
                <input
                  type="file"
                  name="profilePic"
                  id="profilePic"
                  className="hidden"
                  accept="image/*"
                  onChange={changeProfilePic}
                />
              </div>
              <img src={employee.profile_pic} alt="Profile" className="object-cover w-full h-full" />
            </div>

            {/* User Information Section */}
            <div className="bg-white shadow-lg w-full flex flex-col border-2 border-blue-500 rounded-3xl py-12">
              <div className="flex justify-between mb-8 px-12">
                <div className="text-4xl text-blue-700">{t("forms.userinfos")}</div>
                {updateUserTrigger ? (
                  <div
                    className="text-5xl cursor-pointer text-blue-500 hover:text-red-300 transition-colors duration-300"
                    onClick={() => {
                      sendUpdateUser();
                      setUpdateUserTrigger(false);
                    }}
                  >
                    <FaRegSave />
                  </div>
                ) : (
                  <div
                    className="text-5xl cursor-pointer text-blue-500 hover:text-red-300 transition-colors duration-300"
                    onClick={() => {
                      setUpdateUserTrigger(true);
                      setNewUpdateUser({
                        username: employee.user.username,
                        email: employee.user.email,
                        first_name: employee.user.first_name,
                        last_name: employee.user.last_name,
                      });
                    }}
                  >
                    <FaRegEdit />
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-5 py-4 px-1">
                {['username', 'email', 'first_name', 'last_name'].map((field) => (
                  <div key={field} className="flex flex-col w-full md:w-3/4 mx-auto">
                    <label className="px-2 py-2 text-3xl font-semibold text-blue-700">{t(`forms.${field}`)}</label>
                    {updateUserTrigger ? (
                      <input
                        type={field === 'email' ? 'email' : 'text'}
                        name={field}
                        value={newUpdateUser[field]}
                        onChange={handleUpdateUser}
                        className="h-14 md:h-10 w-full px-4 text-3xl text-blue-800 font-semibold border-2 border-blue-300 rounded-2xl shadow-lg"
                      />
                    ) : (
                      <div className="h-14 md:h-10 w-full px-4 text-3xl text-blue-800 font-semibold border-2 border-blue-300 rounded-2xl shadow-lg">
                        {employee.user[field]}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Employee Information Section */}
            <div className="bg-white shadow-2xl w-full flex flex-col border-2 border-blue-500 rounded-3xl py-12">
              <div className="flex justify-between mb-8 px-12">
                <div className="text-4xl text-blue-700">{t("forms.emplinfo")}</div>
                {updateEmployeeTrigger ? (
                  <div
                    className="text-5xl cursor-pointer text-blue-500 hover:text-red-300 transition-colors duration-300"
                    onClick={() => {
                      setUpdateEmployeeTrigger(false);
                      sendUpdateEmployee();
                    }}
                  >
                    <FaRegSave />
                  </div>
                ) : (
                  <div
                    className="text-5xl cursor-pointer text-blue-500 hover:text-red-300 transition-colors duration-300"
                    onClick={() => {
                      setUpdateEmployeeTrigger(true);
                      setNewUpdateEmployee({
                        phone: employee.phone,
                        adress: employee.adress,
                        position: employee.position,
                        gender: employee.gender,
                        recruitmentDate: employee.recruitmentDate,
                        birthday: employee.birthday,
                      });
                    }}
                  >
                    <FaRegEdit />
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-5 py-4 px-1">
                {['phone', 'adress', 'position', 'gender', 'recruitmentDate', 'birthday'].map((field) => (
                  <div key={field} className="flex flex-col w-full md:w-3/4 mx-auto">
                    <label className="px-2 py-2 text-3xl font-semibold text-blue-700">{t(`forms.${field}`)}</label>
                    {updateEmployeeTrigger ? (
                      field === 'position' || field === 'gender' ? (
                        <select
                          name={field}
                          value={newUpdateEmployee[field]}
                          onChange={handleUpdateEmployee}
                          className="h-14 md:h-10 w-full px-4 text-3xl text-blue-800 font-semibold border-2 border-blue-300 rounded-2xl shadow-lg"
                        >
                          {employeeForm?.[field]?.map((ele) => (
                            <option key={ele.value} value={ele.value}>
                              {ele.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={field === 'phone' ? 'tel' : 'date'}
                          name={field}
                          value={newUpdateEmployee[field]}
                          onChange={handleUpdateEmployee}
                          className="h-14 md:h-10 w-full px-4 text-3xl text-blue-800 font-semibold border-2 border-blue-300 rounded-2xl shadow-lg"
                        />
                      )
                    ) : (
                      <div className="h-14 md:h-10 w-full px-4 text-3xl text-blue-800 font-semibold border-2 border-blue-300 rounded-2xl shadow-lg">
                        {field === 'phone' ? formatPhoneNumber(employee[field]) : employee[field]}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;
