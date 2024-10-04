import Principal "mo:base/Principal";
import Nat "mo:base/Nat";
import Cycles "mo:base/ExperimentalCycles";

actor {

  type TrustedOrigins={
    trusted_origins:[Text];
  };

  var totalCLicks:Nat=0;

  public func icrc28_trusted_origins():async TrustedOrigins{
    let trusted_origins=["https://wbbq2-uaaaa-aaaao-a3rba-cai.icp0.io"];
    let origins:TrustedOrigins={
      trusted_origins=trusted_origins;
    };
    return origins;
  };

  public query func greet(name : Text) : async Text {
    return "Hello, " # name # "!";
  };
  public shared({caller}) func whami():async Text{
    return Principal.toText(caller);
  };
  public func getBalanceClick():async Nat{
    totalCLicks:=totalCLicks+1;
    return totalCLicks;
  };
  public func click():async (Nat,Nat,Nat) {
    let balanceBefore=Cycles.balance();
    ignore await getBalanceClick();
    let balanceAfter=Cycles.balance();
    return (totalCLicks,balanceBefore,balanceAfter);
  };
};
