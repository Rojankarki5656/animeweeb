import DynamicLayout from "./DynamicLayout";

const MostPopular = ({ data }) => {
  return (
    <div className="">
      <DynamicLayout data={data} title="Most Popular" endpoint="most-popular" />
    </div>
  );
};

export default MostPopular;
