# 🐕📱 Dogli App

## 🛠️ Tech Stack

  ### Backend

   [![C#](https://img.shields.io/badge/C%23-239120?style=for-the-badge&logo=c-sharp&logoColor=white)](https://docs.microsoft.com/en-us/dotnet/csharp/)
   [![.NET](https://img.shields.io/badge/.NET%208-5C2D91?style=for-the-badge&logo=.net&logoColor=white)](https://dotnet.microsoft.com/en-us/)
   [![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)

  ### Frontend

   [![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactnative.dev/)
   [![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
   [![Firebase](https://img.shields.io/badge/Firebase-039BE5?style=for-the-badge&logo=Firebase&logoColor=FFCA28)](https://firebase.google.com/)
<br>
<br>

## 🏗️ Project Structure

### 🗂️ **Dogli.Api**

- [Program.cs](./Dogli.Api/Program.cs)<br>
- [appsettings.json](Dogli.Api/appsettings.json)<br>
- #### 📂 **Controllers**
  - [DogsController.cs](./Dogli.Api/Controllers/DogsController.cs)<br>
  - [ParksController.cs](./Dogli.Api/Controllers/ParksController.cs)<br>
  - [ReviewsController.cs](./Dogli.Api/Controllers/ReviewsController.cs)<br>
  - [UsersController.cs](./Dogli.Api/Controllers/UsersController.cs)<br>
- #### 📂 **Enums**
  - [CheckInResult.cs](./Dogli.Api/Enums/CheckInResult.cs)<br>
  - [ParkSize.cs](./Dogli.Api/Enums/ParkSize.cs)<br>
- #### 📂 **Extensions**

  - [Encryptor.cs](./Dogli.Api/Extensions/Encryptor.cs)<br>
  - [ExceptionHandlingMiddleware.cs](./Dogli.Api/Extensions/ExceptionHandlingMiddleware.cs)<br>
  - [IEncryptor.cs](./Dogli.Api/Extensions/IEncryptor.cs)<br>
  - [ResultExtensions.cs](./Dogli.Api/Extensions/ResultExtensions.cs)<br>
  - [SwaggerExampleSchemaFilter.cs](./Dogli.Api/Extensions/SwaggerExampleSchemaFilter.cs)<br>

- #### 📂 **Models**

  - ##### DTOs

    - [CheckInDto.cs](./Dogli.Api/Models/DTOs/CheckInDto.cs)<br>
    - [DogDto.cs](./Dogli.Api/Models/DTOs/DogDto.cs)<br>
    - [FollowRequestDto.cs](./Dogli.Api/Models/DTOs/FollowRequestDto.cs)<br>
    - [LoginDto.cs](./Dogli.Api/Models/DTOs/LoginDto.cs)<br>
    - [ParkDto.cs](./Dogli.Api/Models/DTOs/ParkDto.cs)<br>
    - [ReviewDto.cs](./Dogli.Api/Models/DTOs/ReviewDto.cs)<br>
    - [UserProfileDto.cs](./Dogli.Api/Models/DTOs/UserProfileDto.cs)<br>

  - [CheckIn.cs](./Dogli.Api/Models/CheckIn.cs)<br>
  - [Dog.cs](./Dogli.Api/Models/Dog.cs)<br>
  - [GooglePlaceResponse.cs](./Dogli.Api/Models/GooglePlaceResponse.cs)<br>
  - [Park.cs](./Dogli.Api/Models/Park.cs)<br>
  - [ResponseModel.cs](./Dogli.Api/Models/ResponseModel.cs)<br>
  - [Review.cs](./Dogli.Api/Models/Review.cs)<br>
  - [User.cs](./Dogli.Api/Models/User.cs)<br>

- #### 📂 **AutoMapper**

  - [UserProfileMapping.cs](./Dogli.Api/AutoMapper/UserProfileMapping.cs)<br>

- #### 📂 **Repositories**

  - ##### Interfaces
    - [ICheckInRepository.cs](./Dogli.Api/Repositories/Interfaces/ICheckInRepository.cs)<br>
    - [IDogRepository.cs](./Dogli.Api/Repositories/Interfaces/IDogRepository.cs)<br>
    - [IParkRepository.cs](./Dogli.Api/Repositories/Interfaces/IParkRepository.cs)<br>
    - [IReviewRepository.cs](./Dogli.Api/Repositories/Interfaces/IReviewRepository.cs)<br>
    - [IUserRepository.cs](./Dogli.Api/Repositories/Interfaces/IUserRepository.cs)<br>
  - [CheckInRepository.cs](./Dogli.Api/Repositories/CheckInRepository.cs)<br>
  - [DogRepository.cs](./Dogli.Api/Repositories/DogRepository.cs)<br>
  - [ParkRepository.cs](./Dogli.Api/Repositories/ParkRepository.cs)<br>
  - [ReviewRepository.cs](./Dogli.Api/Repositories/ReviewRepository.cs)<br>
  - [UserRepository.cs](./Dogli.Api/Repositories/UserRepository.cs)<br>

- #### 📂 **Services**

  - ##### Interfaces
    - [IDogService.cs](./Dogli.Api/Services/Interfaces/IDogService.cs)<br>
    - [IGooglePlacesService.cs](./Dogli.Api/Services/Interfaces/IGooglePlacesService.cs)<br>
    - [IJwtAuthService.cs](./Dogli.Api/Services/Interfaces/IJwtAuthService.cs)<br>
    - [IParkService.cs](./Dogli.Api/Services/Interfaces/IParkService.cs)<br>
    - [IReviewService.cs](./Dogli.Api/Services/Interfaces/IReviewService.cs)<br>
    - [IUserService.cs](./Dogli.Api/Services/Interfaces/IUserService.cs)<br>
  - [DogService.cs](./Dogli.Api/Services/DogService.cs)<br>
  - [GooglePlacesService.cs](./Dogli.Api/Services/GooglePlacesService.cs)<br>
  - [JwtAuthService.cs](./Dogli.Api/Services/JwtAuthService.cs)<br>
  - [ParkService.cs](./Dogli.Api/Services/ParkService.cs)<br>
  - [ReviewService.cs](./Dogli.Api/Services/ReviewService.cs)<br>
  - [UserService.cs](./Dogli.Api/Services/UserService.cs)<br>

- #### 📂 **Utils**

  - ##### DogUtils
    - [DogErrors.cs](./Dogli.Api/Utils/DogUtils/DogErrors.cs)<br>

- #### 📂 **Validators**
  - [CustomValidators.cs](./Dogli.Api/Validators/CustomValidators.cs)<br>
  - [DogValidator.cs](./Dogli.Api/Validators/DogValidator.cs)<br>
  - [ParkValidator.cs](./Dogli.Api/Validators/ParkValidator.cs)<br>
  - [UserValidator.cs](./Dogli.Api/Validators/UserValidator.cs)<br>
