import {ButtonBase, Card, Grid, Typography} from "@mui/material";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Icon from "../assets/pacto-logo.ico";
import {useHistory} from "react-router-dom";
import {useState} from "react";
import {useParams} from "react-router-dom";
import {useEffect} from "react";
import {Image} from "cloudinary-react";
import Axios from "axios";
import ErrorMessage from "../components/ErrorMessage";
import {LoadingButton} from "@mui/lab";
import {styled} from "@mui/material/styles";
import Loading from "./Loading";
import UploadIcon from '@mui/icons-material/Upload';
import {useAuth} from "../providers/AuthProvider";

const Input = styled("input")({
  display: "none",
});


export default function EditPact() {
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const {user, setUser} = useAuth();
  const {pactId} = useParams();
  const history = useHistory();
  const defaultData = {
    name: "",
    category: "",
    description: "",
    image: ""
  };

  const [isLoading, setIsLoading] = useState(true);

  const [name, setName] = useState(defaultData.name)
  const [category, setCategory] = useState(defaultData.category)
  const [description, setDescription] = useState(defaultData.description)
  const [image, setImage] = useState(defaultData.image)

  const [apiPactNameError, setApiPactNameError] = useState("");
  const [apiPactCategoryError, setApiPactCategoryError] = useState("");
  const [apiPactDescriptionError, setApiPactDescriptionError] = useState("");
  const [snackBarError, setSnackBarError] = useState("")

  const [uploadImageIsDisabled, setUploadImageIsDisabled] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const uploadImage = async (newImage) => {
    setUploadImageIsDisabled(true);
    const data = new FormData();

    data.append("api_key", process.env.REACT_APP_CLOUDINARY_KEY);
    data.append("file", newImage);
    data.append("upload_preset", "n2obmbt1");

    try {
      const res = await Axios.post(`https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/image/upload`, data)
      setImage(res.data.url);
      setSnackbarOpen(false)
    } catch (err) {
      setSnackBarError("Error uploading image")
      setSnackbarOpen(true)
    }
    setUploadImageIsDisabled(false);
  }


  useEffect(() => {
    if(pactId !== undefined) {
      fetch(`${process.env.REACT_APP_URL}/pact/${pactId}`, {
        method: "GET",
        credentials: "include"
      }).then((res) => {
        if (!res.ok) {
          throw Error("Could not fetch pacts");
        }
        return res.json();
      }).then((resData) => {
        const data = resData.message;
        const moderators = data.moderators.flatMap((user) => user._id)
        if(!moderators.includes(user._id)){
          return history.push(`/pact/${pactId}`);
        }
        setName(data.name);
        setCategory(data.category);
        setDescription(data.description);
        setImage(data.image)
        setIsLoading(false);
      }).catch((err) => {
        setSnackBarError(err)
        setSnackbarOpen(true)
        return history.push(`/not-found`);
      })
    }
  }, [pactId, user, history])


  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsButtonDisabled(true);

    setApiPactNameError("");
    setApiPactCategoryError("")
    setApiPactDescriptionError("");

    const response = await fetch(`${process.env.REACT_APP_URL}/pact/${pactId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        "name": name,
        "category": category,
        "description": description,
        "image": image,
      }),
    });


    const json = await response.json();

    Object.values(json["errors"]).forEach(err => {
      const field = err["field"];
      const message = err["message"];

      if (field === "name") {
        setApiPactNameError(message);
      }
      if (field === "category") {
        setApiPactCategoryError(message);
      }
      if (field === "description") {
        setApiPactDescriptionError(message);
      }

      setIsButtonDisabled(false);
    });


    if (response.status === 200) {
      history.push(`/pact/${pactId}`);
      let newUser = Object.assign({}, user);
      setUser(newUser);
    }

  };

  if (isLoading) { return <Loading/>; }

  return (
    <>
      <Card
        sx={{
          padding: "30px",
          margin: "auto",
        }}
      >
        <Grid
          container
          direction="row"
          justifyContent="center"
          alignItems="center"
        >
          <Grid container item xs={12} justifyContent="center" alignItems="center">
            <Avatar alt="Pacto Icon" src={Icon}/>
          </Grid>
          <Grid container item xs={12} justifyContent="center" alignItems="center">
            <Typography component="h1" variant="h5" sx={{fontWeight: "bold"}}>
              Edit Pact
            </Typography>
          </Grid>
        </Grid>
        <Grid container
              item
              direction="row"
              justifyContent="space-evenly"
              alignItems="center"
              xs={12}
              spacing={1}>
          <Grid item xs={8} lg={3}>
            <Card sx={{padding: "10px", margin: "auto"}}>
              <label htmlFor="contained-button-file">
                <Input
                  accept="image/*"
                  id="contained-button-file"
                  data-testid="image-upload-input"
                  disabled={uploadImageIsDisabled}
                  sx={{display: "none"}}
                  type="file"
                  onChange={(e) => {
                    uploadImage(e.target.files[0])
                  }}/>
                <Grid container justifyContent="center">
                  <ButtonBase
                    label="Upload Image"
                    variant="contained"
                    disabled={uploadImageIsDisabled}
                    component="span"
                  >
                    <Image
                      style={{
                        width: "100%",
                        minWidth: "20%",
                        minHeight: "25%",
                        borderRadius: "10px",
                        overflow: "hidden",
                        position: "relative",
                      }}
                      alt="Pact Picture"
                      cloudName={`${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}`}
                      publicID={image}
                    >
                    </Image>
                  </ButtonBase>
                </Grid>

                <LoadingButton
                  loading={uploadImageIsDisabled}
                  loadingPosition="start"
                  startIcon={<UploadIcon/>}
                  fullWidth
                  label="Upload Image"
                  variant="contained"
                  disabled={uploadImageIsDisabled}
                  component="span"
                  sx={{
                    marginTop: 1
                  }}
                >
                  Upload Image
                </LoadingButton>
              </label>
            </Card>

          </Grid>
          <Grid item xs={12} lg={6}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                paddingInline: "10px",
              }}
              lg={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                paddingInline: "50px",
              }}
            >

              <Box
                component="form"
                noValidate
                onSubmit={handleSubmit}
                sx={{mt: 1}}
              >
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  label="Pact Name"
                  data-testid="pact-name"
                  id="name"
                  name="name"
                  error={apiPactNameError.length !== 0}
                  helperText={apiPactNameError}
                  autoFocus
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value)
                  }}
                />

                <TextField
                  data-testid="category-select"
                  alignitems="center"
                  margin="normal"
                  required
                  fullWidth
                  id="category"
                  name="category"
                  label="Category"
                  error={apiPactCategoryError.length !== 0}
                  helperText={apiPactCategoryError}
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value)
                  }}
                >
                </TextField>

                <TextField
                  name="description"
                  margin="normal"
                  id="description"
                  label="Description"
                  required
                  fullWidth
                  multiline
                  rows={4}
                  error={apiPactDescriptionError.length !== 0}
                  helperText={apiPactDescriptionError}
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value)
                  }}
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={isButtonDisabled}
                  sx={{mt: 3, mb: 2}}
                >
                  Edit Pact
                </Button>
              </Box>
            </Box>
          </Grid>
          <ErrorMessage
            isOpen={snackbarOpen}
            setIsOpen={setSnackbarOpen}
            message={snackBarError}
          />
        </Grid>
      </Card>
    </>
  );
}