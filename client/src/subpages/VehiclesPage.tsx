import React, { useEffect, useState, useRef } from "react";
import type { GetProp, TableProps } from "antd";
import { Table, Input, Button, Space } from "antd";
import type { FilterDropdownProps } from "antd/es/table/interface";
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import Highlighter from "react-highlight-words";
import { VehicleInfo, User } from "../types/common";
import { fetchAllVehicles, deleteVehicle } from "../services/vehicleServices";
import AddVehicleModal from "../modals/AddVehiclesModal";
import UpdateVehicleModal from "../modals/UpdateVehicleModal";
import CustomerRentalModal from "../modals/CustomerRentalModal";
import AdminRentalModal from "../modals/AdminRentalModal";

type ColumnsType<T extends object = object> = TableProps<T>["columns"];
type TablePaginationConfig = Exclude<
  GetProp<TableProps, "pagination">,
  boolean
>;

interface TableParams {
  pagination?: TablePaginationConfig;
}

const VehiclesPage: React.FC<User> = ({ user }) => {
  const [data, setData] = useState<VehicleInfo[]>([]);
  const [filteredData, setFilteredData] = useState<VehicleInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [tableParams, setTableParams] = useState<TableParams>({
    pagination: {
      current: 1,
      pageSize: 10,
    },
  });
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef<any>(null);

  const [isAddVehicleModalOpen, setIsAddVehicleModalOpen] = useState(false);
  const [isCustomerRentalModalOpen, setIsCustomerRentalModalOpen] =
    useState(false);
  const [isAdminRentalModalOpen, setIsAdminRentalModalOpen] = useState(false);
  const [isUpdateVehicleModalOpen, setIsUpdateVehicleModalOpen] =
    useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(
    null
  );

  const showAddVehicleModal = () => {
    setIsAddVehicleModalOpen(true);
  };

  const cancelAddVehicleModal = () => {
    setIsAddVehicleModalOpen(false);
  };

  const showCustomerRentalModal = () => {
    setIsCustomerRentalModalOpen(true);
  };

  const cancelCustomerRentalModal = () => {
    setIsCustomerRentalModalOpen(false);
  };

  const showAdminRentalModal = () => {
    setIsAdminRentalModalOpen(true);
  };

  const cancelAdminRentalModal = () => {
    setIsAdminRentalModalOpen(false);
  };

  const showUpdateVehicleModal = () => {
    setIsUpdateVehicleModalOpen(true);
  };

  const cancelUpdateVehicleModal = () => {
    setIsUpdateVehicleModalOpen(false);
  };

  // 搜索逻辑
  const handleSearch = (
    selectedKeys: string[],
    confirm: FilterDropdownProps["confirm"],
    dataIndex: keyof VehicleInfo
  ) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex as string);

    // 根据筛选条件过滤数据
    const filtered = data.filter((item) =>
      item[dataIndex]
        ?.toString()
        .toLowerCase()
        .includes(selectedKeys[0].toLowerCase())
    );
    setFilteredData(filtered);
    setTableParams({
      pagination: {
        ...tableParams.pagination,
        current: 1, // 重置到第一页
        total: filtered.length, // 更新总数
      },
    });
  };

  const handleReset = (clearFilters: () => void) => {
    clearFilters();
    setSearchText("");
    setSearchedColumn("");
    setFilteredData(data); // 恢复原始数据
    setTableParams({
      pagination: {
        ...tableParams.pagination,
        current: 1, // 重置到第一页
        total: data.length, // 恢复总数
      },
    });
  };

  const getColumnSearchProps = (
    dataIndex: keyof VehicleInfo
  ): Exclude<TableProps<VehicleInfo>["columns"], undefined>[number] => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
      close,
    }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() =>
            handleSearch(selectedKeys as string[], confirm, dataIndex)
          }
          style={{ marginBottom: 8, display: "block" }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() =>
              handleSearch(selectedKeys as string[], confirm, dataIndex)
            }
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              confirm({ closeDropdown: false });
              setSearchText((selectedKeys as string[])[0]);
              setSearchedColumn(dataIndex as string);
            }}
          >
            Filter
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}
          >
            Close
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered: boolean) => (
      <SearchOutlined style={{ color: filtered ? "#1677ff" : undefined }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex]
        ?.toString()
        .toLowerCase()
        .includes((value as string).toLowerCase()),
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ""}
        />
      ) : (
        text
      ),
  });

  // 列定义
  const columns: ColumnsType<VehicleInfo> = [
    {
      title: "ID",
      dataIndex: "vehicle_id",
      width: "5%",
    },
    {
      title: "车牌号",
      dataIndex: "plate_number",
      width: "15%",
      ...getColumnSearchProps("plate_number"),
    },
    {
      title: "车辆类型",
      dataIndex: "type",
      width: "10%",
      ...getColumnSearchProps("type"),
    },
    {
      title: "品牌",
      dataIndex: "brand",
      width: "10%",
      ...getColumnSearchProps("brand"),
    },
    {
      title: "型号",
      dataIndex: "model",
      width: "10%",
      ...getColumnSearchProps("model"),
    },
    {
      title: "颜色",
      dataIndex: "color",
      width: "10%",
      ...getColumnSearchProps("color"),
    },
    {
      title: "日租金（元）",
      dataIndex: "price_per_day",
      width: "15%",
      ...getColumnSearchProps("price_per_day"),
    },
    {
      title: "状态",
      dataIndex: "status",
      width: "10%",
      ...getColumnSearchProps("status"),
      render: (status) => {
        let color = "default";
        if (
          status === "cancelled" ||
          status === "finished" ||
          status === null
        ) {
          color = "green";
        } else {
          color = "red";
        }
        return (
          <span style={{ color }}>{color === "green" ? "可用" : "已租出"}</span>
        );
      },
    },
    {
      title: "操作",
      key: "action",
      width: "20%",
      render: (_, record) => (
        <Space>
          {user?.role === "admin" && (
            <Button
              type="link"
              onClick={() => {
                setSelectedVehicleId(record.vehicle_id);
                showUpdateVehicleModal();
              }}
            >
              更新信息
            </Button>
          )}

          {(record.status === "cancelled" ||
            record.status === "finished" ||
            record.status === null) &&
            (user?.role === "admin" ? (
              <Button
                type="link"
                onClick={() => {
                  setSelectedVehicleId(record.vehicle_id);
                  showAdminRentalModal();
                }}
              >
                创建租赁
              </Button>
            ) : (
              <Button
                type="link"
                onClick={() => {
                  setSelectedVehicleId(record.vehicle_id);
                  showCustomerRentalModal();
                }}
              >
                租赁
              </Button>
            ))}

          {user?.role === "admin" && (
            <Button
              type="link"
              onClick={async () => {
                await deleteVehicle(record.vehicle_id);
                fetchData();
              }}
            >
              删除
            </Button>
          )}
        </Space>
      ),
    },
  ];

  // 获取数据
  const fetchData = async () => {
    setLoading(true);
    try {
      const vehicles = await fetchAllVehicles(); // 调用服务函数
      console.log(vehicles);
      setData(vehicles);
      setFilteredData(vehicles); // 初始化筛选数据
      setLoading(false);
      setTableParams({
        pagination: {
          ...tableParams.pagination,
          total: vehicles.length, // 更新总数
        },
      });
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTableChange: TableProps<VehicleInfo>["onChange"] = (
    pagination
  ) => {
    setTableParams({
      pagination,
    });
  };

  return (
    <div>
      {user?.role === "admin" && (
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={showAddVehicleModal}
          style={{ marginBottom: 16 }}
        >
          新增车辆
        </Button>
      )}

      <Table<VehicleInfo>
        columns={columns}
        rowKey={(record) => record.vehicle_id.toString()}
        dataSource={filteredData} // 使用筛选后的数据
        pagination={tableParams.pagination}
        loading={loading}
        onChange={handleTableChange}
      />

      <AddVehicleModal
        open={isAddVehicleModalOpen}
        onCancel={cancelAddVehicleModal}
        onAddSuccess={fetchData}
      />

      <UpdateVehicleModal
        vehicle_id={selectedVehicleId}
        open={isUpdateVehicleModalOpen}
        onCancel={cancelUpdateVehicleModal}
        onUpdateSuccess={fetchData}
      />

      <CustomerRentalModal
        vehicle_id={selectedVehicleId as number}
        customer_id={user.customer_id}
        open={isCustomerRentalModalOpen}
        onCancel={cancelCustomerRentalModal}
        onRentSuccess={fetchData}
      />

      <AdminRentalModal
        vehicle_id={selectedVehicleId as number}
        open={isAdminRentalModalOpen}
        onCancel={cancelAdminRentalModal}
        onRentSuccess={fetchData}
      />
    </div>
  );
};

export default VehiclesPage;
