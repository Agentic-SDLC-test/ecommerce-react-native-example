import React from "react";
import renderer, { act } from "react-test-renderer";
import PaymentBadge from "../components/PaymentBadge";
import PaymentMethodSelector from "../components/PaymentMethodSelector";

jest.mock("@expo/vector-icons", () => ({ Ionicons: "Ionicons" }));

const textOf = (tree, id) => tree.root.findByProps({ testID: id }).props.children;

describe("PaymentBadge", () => {
  it("renders paid card", () => {
    let tree;
    act(() => {
      tree = renderer.create(
        <PaymentBadge order={{ payment_type: "online", payment_status: "paid" }} testID="b" />
      );
    });
    expect(textOf(tree, "b-text")).toBe("Card (demo) · Paid");
  });
  it("renders legacy order as COD pay on delivery", () => {
    let tree;
    act(() => {
      tree = renderer.create(<PaymentBadge order={{}} testID="b" />);
    });
    expect(textOf(tree, "b-text")).toBe("Cash On Delivery · Pay on delivery");
  });
});

describe("PaymentMethodSelector", () => {
  it("calls onChange with the chosen type", () => {
    const onChange = jest.fn();
    let tree;
    act(() => {
      tree = renderer.create(<PaymentMethodSelector value="cod" onChange={onChange} testID="s" />);
    });
    act(() => {
      tree.root.findByProps({ testID: "s-online" }).props.onPress();
    });
    expect(onChange).toHaveBeenCalledWith("online");
    expect(tree.root.findByProps({ testID: "s-cod" })).toBeTruthy();
  });
});
