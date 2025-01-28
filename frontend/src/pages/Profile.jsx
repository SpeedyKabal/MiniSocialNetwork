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
    <div className=" max-w-full">
      {loading && <Loading />}
      <div className="flex mx-auto">
        {Object.keys(employee).length > 0 && (
          <div className="flex flex-col gap-12 w-full items-center ">
            <div className="group w-[300px] h-[300px] my-6 rounded-full overflow-hidden bg-indigo-200 relative">
              <div className="w-full h-full absolute bg-black/70 flex justify-center items-center bottom-0 opacity-0 group-hover:opacity-100  transition-all duration-300">
                <label
                  htmlFor="profilePic"
                  className="text-[5rem] rotate-180 py-2 px-2 text-white cursor-pointer"
                >
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
              <img
                src={employee.profile_pic}
                alt="ProfilePicture"
                className=" object-cover w-full h-full"
              />
            </div>
            <div className="bg-indigo-200/95 drop-shadow-lg w-full flex flex-col border-2 border-green-500 border-solid rounded-3xl py-12">
              <div className="flex flex-wrap justify-between mb-8 px-12">
                <div className="text-4xl">{t("forms.userinfos")}</div>
                {updateUserTrigger ? (
                  <div
                    className="text-5xl cursor-pointer text-indigo-500 hover:text-red-300 transition-colors duration-300"
                    onClick={() => {
                      sendUpdateUser();
                      setUpdateUserTrigger(false);
                    }}
                  >
                    <FaRegSave />
                  </div>
                ) : (
                  <div
                    className="text-5xl cursor-pointer text-indigo-500 hover:text-red-300 transition-colors duration-300"
                    onClick={() => {
                      setUpdateUserTrigger(true);
                      setNewUpdateUser({
                        ...newUpdateUser,
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
                <div className="flex justify-around flex-wrap">
                  <div className="flex flex-col w-full md:w-[650px] h-auto">
                    <label className="px-2 py-2 mx-4 text-3xl font-semibold">
                      {t("forms.username")}
                    </label>
                    {updateUserTrigger ? (
                      <input
                        type="text"
                        id="username"
                        name="username"
                        value={newUpdateUser.username}
                        onChange={handleUpdateUser}
                        className="h-[60px] md:h-[40px] w-full px-4 flex items-center text-3xl text-green-800 font-semibold border-2 border-indigo-300 border-solid rounded-2xl drop-shadow-lg"
                      />
                    ) : (
                      <div className="h-[60px] md:h-[40px] w-full px-4 flex items-center text-3xl text-green-800 font-semibold border-2 border-indigo-300 border-solid rounded-2xl drop-shadow-lg">
                        {employee.user.username}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col w-full md:w-[650px] h-auto">
                    <label className="px-2 py-2 mx-4 text-3xl font-semibold">
                      {t("forms.email")}
                    </label>
                    {updateUserTrigger ? (
                      <input
                        type="email"
                        name="email"
                        id="email"
                        value={newUpdateUser.email}
                        onChange={handleUpdateUser}
                        className="h-[60px] md:h-[40px] w-full px-4 flex items-center text-3xl text-green-800 font-semibold border-2 border-indigo-300 border-solid rounded-2xl drop-shadow-lg"
                      />
                    ) : (
                      <div className="h-[60px] md:h-[40px] w-full px-4 flex items-center text-3xl text-green-800 font-semibold border-2 border-indigo-300 border-solid rounded-2xl drop-shadow-lg">
                        {employee.user.email}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex justify-around flex-wrap">
                  <div className="flex flex-col w-full md:w-[650px] h-auto">
                    <label className="px-2 py-2 mx-4 text-3xl font-semibold">
                      {t("forms.firstname")}
                    </label>
                    {updateUserTrigger ? (
                      <input
                        type="text"
                        name="first_name"
                        id="first_name"
                        value={newUpdateUser.first_name}
                        onChange={handleUpdateUser}
                        className="h-[60px] md:h-[40px] w-full px-4 flex items-center text-3xl text-green-800 font-semibold border-2 border-indigo-300 border-solid rounded-2xl drop-shadow-lg"
                      />
                    ) : (
                      <div className="h-[60px] md:h-[40px] w-full px-4 flex items-center text-3xl text-green-800 font-semibold border-2 border-indigo-300 border-solid rounded-2xl drop-shadow-lg">
                        {employee.user.first_name}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col w-full md:w-[650px] h-auto">
                    <label className="px-2 py-2 mx-4 text-3xl font-semibold">
                      {t("forms.lastname")}
                    </label>
                    {updateUserTrigger ? (
                      <input
                        type="text"
                        name="last_name"
                        id="last_name"
                        value={newUpdateUser.last_name}
                        onChange={handleUpdateUser}
                        className="h-[60px] md:h-[40px] w-full px-4 flex items-center text-3xl text-green-800 font-semibold border-2 border-indigo-300 border-solid rounded-2xl drop-shadow-lg"
                      />
                    ) : (
                      <div className="h-[60px] md:h-[40px] w-full px-4 flex items-center text-3xl text-green-800 font-semibold border-2 border-indigo-300 border-solid rounded-2xl drop-shadow-lg">
                        {employee.user.last_name}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-indigo-200/95 shadow-2xl w-full flex flex-col border-2 border-green-500 border-solid rounded-3xl py-12">
              <div className="flex justify-between mb-8 px-12">
                <div className="text-4xl">{t("forms.emplinfo")}</div>
                {updateEmployeeTrigger ? (
                  <div
                    className="text-5xl cursor-pointer text-indigo-500 hover:text-red-300 transition-colors duration-300"
                    onClick={() => {
                      setUpdateEmployeeTrigger(false);
                      sendUpdateEmployee();
                    }}
                  >
                    <FaRegSave />
                  </div>
                ) : (
                  <div
                    className="text-5xl cursor-pointer text-indigo-500 hover:text-red-300 transition-colors duration-300"
                    onClick={() => {
                      setUpdateEmployeeTrigger(true);
                      setNewUpdateEmployee({
                        ...newUpdateEmployee,
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
              <div className="w-full flex flex-col justify-around py-4 px-4">
                <div className="flex justify-around flex-wrap">
                  <div className="flex flex-col w-full md:w-[650px] h-auto">
                    <label className="px-2 py-2 mx-4 text-3xl font-semibold">
                      {t("forms.phone")}
                    </label>
                    {updateEmployeeTrigger ? (
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
                        value={newUpdateEmployee.phone}
                        onChange={handleUpdateEmployee}
                        className="h-[60px] md:h-[40px] w-full px-4 flex items-center text-3xl text-green-800 font-semibold border-2 border-indigo-300 border-solid rounded-2xl drop-shadow-lg"
                      />
                    ) : (
                      <div className="h-[60px] md:h-[40px] w-full px-4 flex items-center	text-3xl text-green-800 font-semibold border-2 border-indigo-300 border-solid rounded-2xl drop-shadow-lg">
                        {employee.phone && formatPhoneNumber(employee.phone)}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col w-full md:w-[650px] h-auto">
                    <label className="px-2 py-2 mx-4 text-3xl font-semibold">
                      {t("forms.adress")}
                    </label>
                    {updateEmployeeTrigger ? (
                      <input
                        type="text"
                        id="adress"
                        name="adress"
                        value={newUpdateEmployee.adress}
                        onChange={handleUpdateEmployee}
                        className="h-[60px] md:h-[40px] w-full px-4 flex items-center text-3xl text-green-800 font-semibold border-2 border-indigo-300 border-solid rounded-2xl drop-shadow-lg"
                      />
                    ) : (
                      <div className="h-[60px] md:h-[40px] w-full px-4 flex items-center	text-3xl text-green-800 font-semibold border-2 border-indigo-300 border-solid rounded-2xl drop-shadow-lg">
                        {employee.adress}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex justify-around flex-wrap">
                  <div className="flex flex-col w-full md:w-[650px] h-auto">
                    <label className="px-2 py-2 mx-4 text-3xl font-semibold">
                      {t("forms.position")}
                    </label>
                    {updateEmployeeTrigger ? (
                      <select
                        name="position"
                        id="position"
                        className="h-[60px] md:h-[40px] w-full px-4 flex items-center	text-3xl text-green-800 font-semibold border-2 border-indigo-300 border-solid rounded-2xl drop-shadow-lg"
                        value={newUpdateEmployee.position}
                        onChange={handleUpdateEmployee}
                      >
                        {employeeForm?.position.map((ele) => (
                          <option key={ele.value} value={ele.value}>
                            {ele.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="h-[60px] md:h-[40px] w-full px-4 flex items-center	text-3xl text-green-800 font-semibold border-2 border-indigo-300 border-solid rounded-2xl drop-shadow-lg">
                        {employee.position && getPositionLabel()}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col w-full md:w-[650px] h-auto">
                    <label className="px-2 py-2 mx-4 text-3xl font-semibold">
                      {t("forms.gender")}
                    </label>
                    {updateEmployeeTrigger ? (
                      <select
                        name="gender"
                        id="gender"
                        className="h-[60px] md:h-[40px] w-full px-4 flex items-center	text-3xl text-green-800 font-semibold border-2 border-indigo-300 border-solid rounded-2xl drop-shadow-lg"
                        value={newUpdateEmployee.gender}
                        onChange={handleUpdateEmployee}
                      >
                        {employeeForm?.gender?.map((ele) => (
                          <option key={ele.value} value={ele.value}>
                            {ele.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="h-[60px] md:h-[40px] w-full px-4 flex items-center	text-3xl text-green-800 font-semibold border-2 border-indigo-300 border-solid rounded-2xl drop-shadow-lg">
                        {employee?.gender}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex justify-around flex-wrap">
                  <div className="flex flex-col w-full md:w-[650px] h-auto">
                    <label className="px-2 py-2 mx-4 text-3xl font-semibold">
                      {t("forms.recdate")}
                    </label>
                    {updateEmployeeTrigger ? (
                      <input
                        type="date"
                        name="recruitmentDate"
                        id="recruitmentDate"
                        className="h-[60px] md:h-[40px] w-full px-4 flex items-center	text-3xl text-green-800 font-semibold border-2 border-indigo-300 border-solid rounded-2xl drop-shadow-lg"
                        value={newUpdateEmployee.recruitmentDate}
                        onChange={handleUpdateEmployee}
                      />
                    ) : (
                      <div className="h-[60px] md:h-[40px] w-full px-4 flex items-center	text-3xl text-green-800 font-semibold border-2 border-indigo-300 border-solid rounded-2xl drop-shadow-lg">
                        {employee.recruitmentDate}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col w-full md:w-[650px] h-auto">
                    <label className="px-2 py-2 mx-4 text-3xl font-semibold">
                      {t("forms.birthday")}
                    </label>
                    {updateEmployeeTrigger ? (
                      <input
                        type="date"
                        name="birthday"
                        id="birthday"
                        className="h-[60px] md:h-[40px] w-full px-4 flex items-center	text-3xl text-green-800 font-semibold border-2 border-indigo-300 border-solid rounded-2xl drop-shadow-lg"
                        value={newUpdateEmployee.birthday}
                        onChange={handleUpdateEmployee}
                      />
                    ) : (
                      <div className="h-[60px] md:h-[40px] w-full px-4 flex items-center	text-3xl text-green-800 font-semibold border-2 border-indigo-300 border-solid rounded-2xl drop-shadow-lg">
                        {employee.birthday}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;
